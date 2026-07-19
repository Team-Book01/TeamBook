package com.teambook.panorama.domain.post.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.teambook.panorama.domain.post.dto.PostImageResponseDto;
import com.teambook.panorama.domain.post.service.PostImageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PostImageController {
    private final PostImageService postImageService;

    @PostMapping("/posts/images")
    public ResponseEntity<List<PostImageResponseDto>> uploadImages(
            @AuthenticationPrincipal Long userId,
            @RequestPart("images") List<MultipartFile> files) {
        List<PostImageResponseDto> response = postImageService.uploadImages(files);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
