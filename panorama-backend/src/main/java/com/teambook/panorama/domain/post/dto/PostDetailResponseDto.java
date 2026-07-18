package com.teambook.panorama.domain.post.dto;

import java.time.LocalDateTime;

import com.teambook.panorama.domain.post.enums.PostCategory;

public record PostDetailResponseDto(Long postId, Long bookId, Long userId, String nickname, PostCategory category, String title, String content, int viewCount, LocalDateTime createdAt, boolean liked, boolean scrapped, long likeCount, String bookTitle, String bookAuthor, String bookImageUrl, String isbn) {

}
