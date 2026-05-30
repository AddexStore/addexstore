package com.addexstores.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileUploadService {

    String uploadFile(MultipartFile file, String directory);

    void deleteFile(String fileUrl);

    String getFileUrl(String relativePath);
}
