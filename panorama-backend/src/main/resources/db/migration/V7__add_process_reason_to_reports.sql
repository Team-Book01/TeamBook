-- ============================================================
-- V7: reports 에 관리자 처리 사유(process_reason) 추가
--
-- 화면(신고 상세 → 처리)에서 입력받던 사유가 admin_action_log 에만 들어가
-- 어느 조회에서도 다시 읽히지 않았다(INSERT 만 있고 SELECT 가 없음).
-- reports 는 이미 handler_user_id(누가) · processed_at(언제)을 갖고 있으므로
-- 같은 처리 결정의 "왜"도 같은 행에 둔다.
--
-- admin_action_log 는 그대로 유지한다. 신고뿐 아니라 사용자 제재·커뮤니티
-- 조치까지 함께 쌓는 관리자 행위 전반의 감사 스트림이라 목적이 다르다.
--
-- 컬럼명이 reason 이 아닌 process_reason 인 이유: 같은 테이블의 reason_type 은
-- 신고자가 고른 신고 사유라, reason 으로 두면 누가 쓴 값인지 구분되지 않는다.
-- ============================================================

ALTER TABLE `reports`
    ADD COLUMN `process_reason` VARCHAR(500) NULL COMMENT '관리자 처리 사유' AFTER `processed_at`;
