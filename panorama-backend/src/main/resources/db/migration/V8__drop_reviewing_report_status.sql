-- ============================================================
-- V8: 신고 처리 상태에서 REVIEWING 제거
--
-- REVIEWING 은 "관리자가 보고 있다"는 표시일 뿐 처리 결과가 아니었다. 어차피
-- PENDING 과 똑같이 미처리로 조회되고, 종결은 항상 RESOLVED/REJECTED 로만
-- 일어나므로 상태가 하나 늘어난 만큼의 값이 없었다. 관리자가 실수로 고르면
-- 아무것도 안 바뀐 채 "처리했다"는 착각만 남는다.
--
-- 기존 REVIEWING 행은 PENDING 으로 되돌린다. RESOLVED 로 밀면 처리되지 않은
-- 신고가 종결된 것으로 둔갑하므로, 열린 상태끼리 합치는 쪽이 안전하다.
-- handler_user_id / processed_at 은 건드리지 않는다 — REVIEWING 은 종결이
-- 아니라 이 값들이 애초에 비어 있고, 혹 남아 있다면 누가 들여다봤는지에 대한
-- 유일한 기록이라 지울 이유가 없다.
-- ============================================================

UPDATE `reports`
SET `status` = 'PENDING'
WHERE `status` = 'REVIEWING';

ALTER TABLE `reports`
    MODIFY COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        COMMENT '처리 상태 (PENDING, RESOLVED, REJECTED)';
