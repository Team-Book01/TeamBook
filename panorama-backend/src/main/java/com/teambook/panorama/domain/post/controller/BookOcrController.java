package com.teambook.panorama.domain.post.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.teambook.panorama.domain.post.dto.BookOcrResponseDto;
import com.teambook.panorama.domain.post.service.BookOcrService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class BookOcrController {
    private final BookOcrService bookOcrService;

    @PostMapping("/books/ocr")
    public ResponseEntity<BookOcrResponseDto> extractIsbn(
            @AuthenticationPrincipal Long userId,
            @RequestPart("image") MultipartFile image) {
        return ResponseEntity.ok(new BookOcrResponseDto(bookOcrService.extractIsbn(image)));
    }
}
