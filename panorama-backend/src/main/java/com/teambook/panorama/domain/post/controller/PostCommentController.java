package com.teambook.panorama.domain.post.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.teambook.panorama.domain.post.dto.PostCommentListResponseDto;
import com.teambook.panorama.domain.post.dto.PostCommentRequestDto;
import com.teambook.panorama.domain.post.dto.PostCommentResponseDto;
import com.teambook.panorama.domain.post.dto.PostCommentUpdateRequestDto;
import com.teambook.panorama.domain.post.service.PostCommentService;
import com.teambook.panorama.global.response.SliceResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.net.URI;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PostCommentController {
    private final PostCommentService postCommentService;

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<PostCommentResponseDto> create(@RequestHeader("X-USER-ID") Long userId,
            @PathVariable("postId") Long postId, @Valid @RequestBody PostCommentRequestDto request) {
        Long commentId = postCommentService.createComment(userId, postId, request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(commentId).toUri();

        return ResponseEntity.created(location).body(new PostCommentResponseDto(commentId));
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<SliceResponse<PostCommentListResponseDto>> findComments(@PathVariable("postId") Long postId,
            @PageableDefault(size = 10) Pageable pageable) {
        Slice<PostCommentListResponseDto> slice = postCommentService.findComments(postId, pageable);
        return ResponseEntity.ok(SliceResponse.of(slice));
    }

    @PutMapping("/posts/{postId}/comments/{commentId}")
    public ResponseEntity<PostCommentResponseDto> update(@PathVariable("postId") Long postId,
            @PathVariable("commentId") Long commentId, @RequestHeader("X-USER-ID") Long userId,
            @Valid @RequestBody PostCommentUpdateRequestDto request) {
        PostCommentResponseDto response = postCommentService.updateComment(postId, commentId, userId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/posts/{postId}/comments/{commentId}")
    public ResponseEntity<Void> delete(@PathVariable("postId") Long postId,
            @PathVariable("commentId") Long commentId, @RequestHeader("X-USER-ID") Long userId) {
        postCommentService.deleteComment(postId, commentId, userId);
        return ResponseEntity.noContent().build();
    }
}
