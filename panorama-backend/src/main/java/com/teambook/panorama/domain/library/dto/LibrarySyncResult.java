package com.teambook.panorama.domain.library.dto;

import java.time.LocalDateTime;

/**
 * 도서관 데이터 동기화 결과.
 *
 * @param processed 실제로 DB에 반영된 총 건수(insert + update)
 * @param inserted  신규 insert 건수
 * @param updated   기존 update 건수
 * @param skipped   필수값 누락 등으로 건너뛴 건수
 * @param syncedAt  동기화 완료 시각
 */
public record LibrarySyncResult(
    int processed,
    int inserted,
    int updated,
    int skipped,
    LocalDateTime syncedAt
) {}
