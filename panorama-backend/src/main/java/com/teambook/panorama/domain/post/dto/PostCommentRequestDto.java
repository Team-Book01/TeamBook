package com.teambook.panorama.domain.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PostCommentRequestDto(Long replyToCommentId, @NotBlank @Size(max = 500) String content) {
    
}
