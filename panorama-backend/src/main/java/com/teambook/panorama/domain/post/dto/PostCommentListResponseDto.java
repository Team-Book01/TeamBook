// 루트용 DTO
package com.teambook.panorama.domain.post.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PostCommentListResponseDto(Long commentId, String nickname, String content, LocalDateTime createdAt, List<PostCommentReplyResponseDto> replies) {

}
