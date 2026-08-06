package com.addexstores.service.impl;

import com.addexstores.exception.BadRequestException;
import com.addexstores.service.FileUploadService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
public class FileUploadServiceImpl implements FileUploadService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private static final byte[] PNG_MAGIC = {(byte) 0x89, 0x50, 0x4E, 0x47};
    private static final byte[] JPEG_MAGIC = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] GIF_MAGIC = {'G', 'I', 'F', '8'};
    private static final byte[] RIFF_MAGIC = {'R', 'I', 'F', 'F'};

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String bucketName;
    private final String region;
    private final Path uploadDir;
    private final boolean useS3;

    public FileUploadServiceImpl(
            S3Client s3Client,
            S3Presigner s3Presigner,
            @Value("${aws.s3.bucket:}") String bucketName,
            @Value("${aws.s3.region:us-east-1}") String region,
            @Value("${app.upload.dir:./uploads}") String uploadDirPath) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.bucketName = bucketName;
        this.region = region;
        this.uploadDir = Paths.get(uploadDirPath).toAbsolutePath().normalize();
        this.useS3 = s3Client != null && !bucketName.isBlank();
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

        if (useS3) {
            return uploadToS3(file, key);
        }
        return uploadToLocal(file, directory, uniqueFilename);
    }

    private String uploadToS3(MultipartFile file, String key) {
        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize())
            );
            log.info("File uploaded to S3: {}", key);
            return key;
        } catch (IOException e) {
            log.error("Failed to upload file to S3", e);
            throw new BadRequestException("Failed to upload file: " + e.getMessage());
        }
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
        if (useS3) {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileUrl)
                    .build());
            log.info("File deleted from S3: {}", fileUrl);
        } else {
            try {
                Path filePath = uploadDir.resolve(fileUrl).normalize();
                if (!filePath.startsWith(uploadDir)) {
                    throw new BadRequestException("Invalid file path");
                }
                Files.deleteIfExists(filePath);
                log.info("File deleted locally: {}", fileUrl);
            } catch (IOException e) {
                log.warn("Failed to delete file: {}", fileUrl, e);
            }
        }
    }

    @Override
    public String getFileUrl(String relativePath) {
        if (useS3) {
            if (s3Presigner != null) {
                PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(
                        builder -> builder
                                .signatureDuration(Duration.ofMinutes(60))
                                .getObjectRequest(req -> req
                                        .bucket(bucketName)
                                        .key(relativePath)
                                        .build())
                                .build());
                return presignedRequest.url().toString();
            }
            return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, relativePath);
        }
        return "/uploads/" + relativePath.replace("\\", "/");
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
