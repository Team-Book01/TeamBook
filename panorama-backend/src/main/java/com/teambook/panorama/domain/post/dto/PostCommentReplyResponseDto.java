// 답댓글용 DTO
package com.teambook.panorama.domain.post.dto;

import java.time.LocalDateTime;

public record PostCommentReplyResponseDto(Long commentId, String nickname, String content, LocalDateTime createdAt, String mentionNickname) {

}
