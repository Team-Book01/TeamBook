package com.teambook.panorama.domain.post.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.teambook.panorama.domain.post.dto.PostCommentRequestDto;
import com.teambook.panorama.domain.post.dto.PostCommentResponseDto;
import com.teambook.panorama.domain.post.service.PostCommentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;


@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PostCommentController {
    private final PostCommentService postCommentService;

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<PostCommentResponseDto> create(@RequestHeader("X-USER-ID") Long userId, @PathVariable("postId") Long postId, @Valid @RequestBody PostCommentRequestDto request) {
        Long commentId = postCommentService.createComment(userId, postId, request);
        
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}").buildAndExpand(commentId).toUri();
        
        return ResponseEntity.created(location).body(new PostCommentResponseDto(commentId));
    }
}
