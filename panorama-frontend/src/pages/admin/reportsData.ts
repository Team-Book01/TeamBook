import {
  AlertTriangle, CheckCircle, XCircle, Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
export type ReportStatus = "PENDING" | "REVIEWING" | "RESOLVED" | "REJECTED";
export type TargetType   = "POST" | "COMMENT" | "REVIEW" | "USER";
export type ReportReason = "욕설·비방" | "스팸" | "허위정보" | "음란성" | "기타";

export interface Report {
  id: string;
  targetType: TargetType;
  targetTitle: string;
  reason: ReportReason;
  detail: string;
  reporter: string;
  status: ReportStatus;
  handler: string;
  reportedAt: string;
  duplicateCount: number;
}

// ── Sample data ────────────────────────────────────────────────────────────────
export const REPORTS: Report[] = [
  { id: "RPT-0841", targetType: "COMMENT", targetTitle: "\"쓰레기같은 책 추천하지마라\" — 댓글", reason: "욕설·비방", detail: "특정 작가 및 독자를 향한 심각한 욕설과 인신공격 포함. 게시 후 12분 내 3건의 동일 신고 접수.", reporter: "park****", status: "PENDING", handler: "—", reportedAt: "2026.07.03 14:22", duplicateCount: 3 },
  { id: "RPT-0840", targetType: "POST",    targetTitle: "동일 내용 반복 게시 (10회 이상)",         reason: "스팸",    detail: "동일한 외부 쇼핑몰 링크를 포함한 게시글을 반복 작성. 독서 게시판 정상 이용 방해.", reporter: "lee****",  status: "PENDING", handler: "—", reportedAt: "2026.07.03 11:05", duplicateCount: 7 },
  { id: "RPT-0839", targetType: "REVIEW",  targetTitle: "\"이 책은 절판됐습니다\" — 사실 아님",     reason: "허위정보", detail: "현재 유통 중인 도서를 절판으로 허위 기재하여 독자 혼란 유발 및 구매 방해.", reporter: "choi****", status: "PENDING", handler: "—", reportedAt: "2026.07.02 19:47", duplicateCount: 0 },
  { id: "RPT-0838", targetType: "COMMENT", targetTitle: "특정 작가 비하 및 인신공격 댓글",          reason: "욕설·비방", detail: "특정 작가의 외모와 출신을 비하하는 혐오 표현 사용. 반복 계정으로 추정됨.", reporter: "jung****", status: "PENDING", handler: "—", reportedAt: "2026.07.02 16:30", duplicateCount: 2 },
  { id: "RPT-0837", targetType: "POST",    targetTitle: "이벤트 링크 대량 살포 (DM 포함)",          reason: "스팸",    detail: "무관한 외부 이벤트 링크를 여러 게시물 댓글과 DM으로 반복 전송.", reporter: "yoon****", status: "PENDING", handler: "—", reportedAt: "2026.07.01 09:14", duplicateCount: 5 },
  { id: "RPT-0836", targetType: "USER",    targetTitle: "유저 프로필: han**** (작가 사칭)",          reason: "허위정보", detail: "작가 사칭 및 허위 수상 이력 기재. 팬 커뮤니티 신뢰도 훼손 우려.", reporter: "kim****",  status: "REVIEWING", handler: "이운영", reportedAt: "2026.07.01 08:55", duplicateCount: 0 },
  { id: "RPT-0835", targetType: "REVIEW",  targetTitle: "성인 도서 내용 무단 발췌 리뷰",             reason: "음란성",  detail: "19세 이상 제한 도서의 명시적 내용을 무삭제 그대로 인용하여 게시.", reporter: "oh****",   status: "REVIEWING", handler: "박지훈", reportedAt: "2026.06.30 22:11", duplicateCount: 1 },
  { id: "RPT-0834", targetType: "COMMENT", targetTitle: "\"이 책 완전 사기임\" — 근거 없는 비방",    reason: "허위정보", detail: "도서 내용과 전혀 무관한 허위 사실을 사실인 것처럼 반복 게시.", reporter: "shin****", status: "REVIEWING", handler: "이운영", reportedAt: "2026.06.30 14:33", duplicateCount: 0 },
  { id: "RPT-0833", targetType: "POST",    targetTitle: "독서 모임 사기 모집글",                    reason: "기타",    detail: "실제 존재하지 않는 독서 모임을 통해 회비 명목 입금을 유도하는 사기 게시물.", reporter: "kwon****", status: "RESOLVED", handler: "박지훈", reportedAt: "2026.06.29 10:20", duplicateCount: 4 },
  { id: "RPT-0832", targetType: "USER",    targetTitle: "유저 프로필: ryu**** (자사 도서 홍보)",     reason: "스팸",    detail: "출판사 직원으로 추정되는 계정이 자사 도서만 반복 추천. 이해충돌 의혹.", reporter: "han****",  status: "REJECTED", handler: "이운영", reportedAt: "2026.06.28 16:45", duplicateCount: 0 },
];

// ── Badge configs ──────────────────────────────────────────────────────────────
export const STATUS_CFG: Record<ReportStatus, { label: string; bg: string; text: string; dot: string }> = {
  PENDING:   { label: "대기",   bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-500" },
  REVIEWING: { label: "검토중", bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  RESOLVED:  { label: "완료",   bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500" },
  REJECTED:  { label: "반려",   bg: "bg-gray-100",  text: "text-gray-400",   dot: "bg-gray-300" },
};

export const TARGET_CFG: Record<TargetType, { label: string; bg: string; text: string }> = {
  POST:    { label: "게시글", bg: "bg-blue-50",    text: "text-blue-600" },
  COMMENT: { label: "댓글",   bg: "bg-gray-100",   text: "text-gray-500" },
  REVIEW:  { label: "리뷰",   bg: "bg-emerald-50", text: "text-emerald-600" },
  USER:    { label: "유저",   bg: "bg-purple-50",  text: "text-purple-600" },
};

export const REASON_CFG: Record<ReportReason, { bg: string; text: string }> = {
  "욕설·비방": { bg: "bg-pink-50",   text: "text-pink-600" },
  "스팸":       { bg: "bg-violet-50", text: "text-violet-600" },
  "허위정보":   { bg: "bg-sky-50",    text: "text-sky-600" },
  "음란성":     { bg: "bg-orange-50", text: "text-orange-600" },
  "기타":       { bg: "bg-gray-100",  text: "text-gray-500" },
};

export interface StatCard {
  label: string;
  sub: string;
  val: number;
  icon: LucideIcon;
  iconBg: string;
  iconC: string;
  valC: string;
  accent: boolean;
}

export const statCards: StatCard[] = [
  { label: "처리 대기",  sub: "즉시 처리 필요",  val: 7,   icon: AlertTriangle, iconBg: "bg-red-50",    iconC: "text-red-400",    valC: "text-red-600",  accent: true },
  { label: "검토중",     sub: "담당자 검토 중",   val: 3,   icon: Clock,         iconBg: "bg-yellow-50", iconC: "text-yellow-500", valC: "text-yellow-600", accent: false },
  { label: "처리 완료", sub: "이번 달 누적",     val: 128, icon: CheckCircle,   iconBg: "bg-green-50",  iconC: "text-green-500",  valC: "text-[#1E4B3C]", accent: false },
  { label: "반려",       sub: "증거 불충분 등",   val: 21,  icon: XCircle,       iconBg: "bg-gray-100",  iconC: "text-gray-400",   valC: "text-gray-500", accent: false },
];
