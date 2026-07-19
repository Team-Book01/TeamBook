package com.teambook.panorama.domain.library.dto;

import java.time.LocalDateTime;

/**
 * 도서관 데이터 동기화 결과.
 *
 * @param processed 실제로 DB에 반영된 총 건수(insert + update)
 * @param inserted  신규 insert 건수
 * @param updated   기존 update 건수
 * @param skipped   필수값 누락·데이터 오류로 저장하지 않은 건수
 * @param removed   저장하지 않기로 한 건 중, 이전 동기화 때 들어와 있어 삭제한 건수
 * @param syncedAt  동기화 완료 시각
 */
public record LibrarySyncResult(
    int processed,
    int inserted,
    int updated,
    int skipped,
    int removed,
    LocalDateTime syncedAt
) {}
