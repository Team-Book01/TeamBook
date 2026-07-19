package com.teambook.panorama.domain.post.service;

import org.springframework.web.multipart.MultipartFile;

public interface BookOcrService {
    String extractIsbn(MultipartFile image);
}