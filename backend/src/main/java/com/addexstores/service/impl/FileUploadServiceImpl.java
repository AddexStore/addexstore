package com.addexstores.service.impl;

import com.addexstores.exception.BadRequestException;
import com.addexstores.service.FileUploadService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class FileUploadServiceImpl implements FileUploadService {

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    private final Path uploadDir;

    public FileUploadServiceImpl(@Value("${app.upload.dir:./uploads}") String uploadDirPath) {
        this.uploadDir = Paths.get(uploadDirPath).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(uploadDir);
            log.info("Upload directory created: {}", uploadDir);
        } catch (IOException e) {
            log.error("Could not create upload directory", e);
        }
    }

    @Override
    public String uploadFile(MultipartFile file, String directory) {
        validateFile(file);

        try {
            Path targetDir = uploadDir.resolve(directory);
            Files.createDirectories(targetDir);

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String uniqueFilename = UUID.randomUUID().toString() + extension;
            Path targetPath = targetDir.resolve(uniqueFilename);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String relativePath = directory + "/" + uniqueFilename;
            log.info("File uploaded: {}", relativePath);
            return relativePath;
        } catch (IOException e) {
            log.error("Failed to upload file", e);
            throw new BadRequestException("Failed to upload file: " + e.getMessage());
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        try {
            Path filePath = uploadDir.resolve(fileUrl).normalize();
            if (!filePath.startsWith(uploadDir)) {
                throw new BadRequestException("Invalid file path");
            }
            Files.deleteIfExists(filePath);
            log.info("File deleted: {}", fileUrl);
        } catch (IOException e) {
            log.warn("Failed to delete file: {}", fileUrl, e);
        }
    }

    @Override
    public String getFileUrl(String relativePath) {
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
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG images are allowed");
        }
    }
}
