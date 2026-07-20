package com.teambook.panorama.global.storage;

/**
 * 디스크에 저장을 마친 이미지 1건의 메타데이터.
 *
 * <p>도메인별 이미지 테이블(post_images, notice_images ...)에 행을 만들 때 필요한 값만 담는다.
 * 어느 테이블에 넣을지는 각 도메인 서비스가 정한다.</p>
 */
public record StoredImage(
    String imageKey,          // 스토리지 객체 키 (UUID + 확장자)
    String imageUrl,          // 접근 URL ("/images/{key}")
    String originalFileName,  // 원본 파일명 (기록용)
    String contentType,       // 검증된 MIME
    long fileSize
) {
}
