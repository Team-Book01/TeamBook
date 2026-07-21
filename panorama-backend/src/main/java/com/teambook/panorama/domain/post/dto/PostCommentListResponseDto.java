// 루트용 DTO
package com.teambook.panorama.domain.post.dto;

import java.time.LocalDateTime;
import java.util.List;

// status: 댓글 상태(ACTIVE/DELETED/HIDDEN). 삭제·숨김 댓글도 노출하되, 프론트에서 수정/삭제 버튼을 감추는 판단에 쓴다.
public record PostCommentListResponseDto(Long commentId, String nickname, String content, LocalDateTime createdAt, String status, List<PostCommentReplyResponseDto> replies) {

}
