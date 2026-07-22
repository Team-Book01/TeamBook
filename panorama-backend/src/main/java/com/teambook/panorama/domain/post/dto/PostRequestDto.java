package com.teambook.panorama.domain.post.dto;

import java.util.List;

import com.teambook.panorama.domain.post.enums.PostCategory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * dto에 record를 사용하는 이유
 * 필드 값 변질의 우려가 없고(final 처리되기 때문), 보일러 플레이트 코드를 자동 생성해줘서 Lombok에서 제공하는 어노테이션마저 사용할 필요가 없다
 */
public record PostRequestDto (@NotNull PostCategory category, @NotBlank @Size(max = 255) String title, @NotBlank String content, List<String> imageKeys, String isbn, String bookTitle, String bookAuthor, String bookImageUrl, String description, String pubdate, String publisher, String shopUrl, String discount) {

}
