package com.addexstores.service.impl;

import com.addexstores.exception.BadRequestException;
import com.addexstores.service.FileUploadService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class FileUploadServiceImpl implements FileUploadService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private static final byte[] PNG_MAGIC = {(byte) 0x89, 0x50, 0x4E, 0x47};
    private static final byte[] JPEG_MAGIC = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] GIF_MAGIC = {'G', 'I', 'F', '8'};
    private static final byte[] RIFF_MAGIC = {'R', 'I', 'F', 'F'};

    private static final String S3_UPLOADS_PREFIX = "/uploads/";

    private static final Set<String> ACL_BLOCKED_ERROR_CODES = Set.of(
            "AccessControlListNotSupported", "InvalidArgument", "InvalidRequest",
            "AccessControlListNotSupportedError");

    private final S3Client s3Client;
    private final String bucketName;
    private final String region;
    private final Path uploadDir;
    private final boolean useS3;

    public FileUploadServiceImpl(
            ObjectProvider<S3Client> s3ClientProvider,
            @Value("${aws.s3.bucket:}") String bucketName,
            @Value("${aws.s3.region:us-east-1}") String region,
            @Value("${app.upload.dir:./uploads}") String uploadDirPath) {
        this.s3Client = s3ClientProvider.getIfAvailable();
        this.bucketName = bucketName;
        this.region = region;
        this.uploadDir = Paths.get(uploadDirPath).toAbsolutePath().normalize();
        this.useS3 = this.s3Client != null && !bucketName.isBlank();
    }

    @PostConstruct
    public void init() {
        if (useS3) {
            log.info("File upload configured: AWS S3 (bucket: {}, region: {})", bucketName, region);
        } else {
            log.info("File upload configured: local storage ({})", uploadDir);
            try {
                Files.createDirectories(uploadDir);
            } catch (IOException e) {
                log.error("Could not create upload directory", e);
            }
        }
    }

    @Override
    public String uploadFile(MultipartFile file, String directory) {
        validateFile(file);

        String extension = extensionFor(file);
        String uniqueFilename = UUID.randomUUID() + extension;
        String key = directory + "/" + uniqueFilename;

        String storedReference;
        if (useS3) {
            storedReference = uploadToS3(file, key);
        } else {
            storedReference = uploadToLocal(file, directory, uniqueFilename);
        }
        return getFileUrl(storedReference);
    }

    private String uploadToS3(MultipartFile file, String key) {
        try {
            try {
                s3Client.putObject(
                        PutObjectRequest.builder()
                                .bucket(bucketName)
                                .key(key)
                                .contentType(file.getContentType())
                                .acl(ObjectCannedACL.PUBLIC_READ)
                                .build(),
                        RequestBody.fromInputStream(file.getInputStream(), file.getSize())
                );
                log.info("File uploaded to S3 with public-read ACL: {}", key);
            } catch (S3Exception e) {
                if (isAclNotSupported(e)) {
                    log.warn("Bucket does not support object ACLs; retrying without ACL. "
                            + "Ensure the bucket policy grants public read access. {}", e.getMessage());
                    s3Client.putObject(
                            PutObjectRequest.builder()
                                    .bucket(bucketName)
                                    .key(key)
                                    .contentType(file.getContentType())
                                    .build(),
                            RequestBody.fromInputStream(file.getInputStream(), file.getSize())
                    );
                } else {
                    throw e;
                }
            }
            return key;
        } catch (IOException e) {
            log.error("Failed to upload file to S3", e);
            throw new BadRequestException("Failed to upload file: " + e.getMessage());
        }
    }

    private boolean isAclNotSupported(S3Exception e) {
        String errorCode = e.awsErrorDetails() != null ? e.awsErrorDetails().errorCode() : null;
        if (errorCode != null && ACL_BLOCKED_ERROR_CODES.contains(errorCode)) {
            return true;
        }
        int status = e.statusCode();
        String message = e.getMessage() == null ? "" : e.getMessage().toLowerCase(Locale.ROOT);
        return (status == 400 || status == 403)
                && (message.contains("acl") || message.contains("access control"));
    }

    private String uploadToLocal(MultipartFile file, String directory, String uniqueFilename) {
        try {
            Path targetDir = uploadDir.resolve(directory);
            Files.createDirectories(targetDir);
            Path targetPath = targetDir.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            String relativePath = directory + "/" + uniqueFilename;
            log.info("File uploaded locally: {}", relativePath);
            return relativePath;
        } catch (IOException e) {
            log.error("Failed to upload file locally", e);
            throw new BadRequestException("Failed to upload file: " + e.getMessage());
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }
        String key = extractKey(fileUrl);
        if (useS3) {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build());
            log.info("File deleted from S3: {}", key);
        } else {
            try {
                Path filePath = uploadDir.resolve(key).normalize();
                if (!filePath.startsWith(uploadDir)) {
                    throw new BadRequestException("Invalid file path");
                }
                Files.deleteIfExists(filePath);
                log.info("File deleted locally: {}", key);
            } catch (IOException e) {
                log.warn("Failed to delete file: {}", key, e);
            }
        }
    }

    @Override
    public String getFileUrl(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return null;
        }
        String value = relativePath.trim();

        if (value.startsWith("http://") || value.startsWith("https://")) {
            return value;
        }
        if (value.startsWith("<") || value.startsWith("data:")) {
            return value;
        }
        if (value.startsWith("/assets/")) {
            return value;
        }
        if (value.startsWith(S3_UPLOADS_PREFIX)) {
            value = value.substring(S3_UPLOADS_PREFIX.length());
        } else if (value.startsWith("/")) {
            return value;
        }

        String key = value.replace("\\", "/");
        if (useS3) {
            return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
        }
        return "/uploads/" + key;
    }

    private String extractKey(String urlOrPath) {
        String value = urlOrPath.trim();
        if (value.startsWith("http://") || value.startsWith("https://")) {
            try {
                URI uri = URI.create(value);
                String path = uri.getPath();
                if (path != null) {
                    return path.startsWith("/") ? path.substring(1) : path;
                }
            } catch (IllegalArgumentException ignored) {
                log.warn("Could not parse file URL, using raw value: {}", value);
            }
        }
        if (value.startsWith(S3_UPLOADS_PREFIX)) {
            return value.substring(S3_UPLOADS_PREFIX.length());
        }
        if (value.startsWith("/")) {
            return value.substring(1);
        }
        return value;
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds maximum allowed size of 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            throw new BadRequestException("Unable to determine file type");
        }

        String normalizedType = contentType.toLowerCase(Locale.ROOT);
        boolean isSvg = "image/svg+xml".equals(normalizedType);

        if (isSvg) {
            if (!isValidSvg(file)) {
                throw new BadRequestException("Invalid or unsafe SVG file");
            }
            return;
        }

        if (!isValidImageMagicBytes(file, normalizedType)) {
            throw new BadRequestException("File content does not match its declared type. Only JPEG, PNG, GIF, WebP, and SVG images are allowed");
        }
    }

    private boolean isValidSvg(MultipartFile file) {
        try (InputStream in = file.getInputStream()) {
            byte[] bytes = in.readNBytes((int) Math.min(file.getSize(), MAX_FILE_SIZE));
            String content = new String(bytes, StandardCharsets.UTF_8).toLowerCase(Locale.ROOT);
            if (!content.contains("<svg")) {
                return false;
            }
            return !content.contains("<script")
                    && !content.contains("foreignobject")
                    && !content.contains("javascript:")
                    && !content.contains("vbscript:")
                    && !content.contains("expression(")
                    && !content.contains("onload=")
                    && !content.contains("onclick=")
                    && !content.contains("onerror=")
                    && !content.contains("onmouseover=")
                    && !content.contains("onfocus=");
        } catch (IOException e) {
            log.warn("Failed to validate SVG content", e);
            return false;
        }
    }

    private boolean isValidImageMagicBytes(MultipartFile file, String contentType) {
        byte[] header;
        try (InputStream in = file.getInputStream()) {
            header = in.readNBytes(12);
        } catch (IOException e) {
            log.warn("Failed to read file header", e);
            return false;
        }

        switch (contentType) {
            case "image/png":
                return startsWith(header, PNG_MAGIC);
            case "image/jpeg":
            case "image/jpg":
                return startsWith(header, JPEG_MAGIC);
            case "image/gif":
                return startsWith(header, GIF_MAGIC);
            case "image/webp":
                return startsWith(header, RIFF_MAGIC) && header.length > 11
                        && header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P';
            default:
                return false;
        }
    }

    private boolean startsWith(byte[] data, byte[] magic) {
        if (data.length < magic.length) {
            return false;
        }
        for (int i = 0; i < magic.length; i++) {
            if (data[i] != magic[i]) {
                return false;
            }
        }
        return true;
    }

    private String extensionFor(MultipartFile file) {
        String contentType = file.getContentType() == null
                ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        switch (contentType) {
            case "image/jpeg":
            case "image/jpg":
                return ".jpg";
            case "image/png":
                return ".png";
            case "image/gif":
                return ".gif";
            case "image/webp":
                return ".webp";
            case "image/svg+xml":
                return ".svg";
            default:
                throw new BadRequestException("Unsupported image type");
        }
    }
}
