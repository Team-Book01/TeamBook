import {
  Clock, Inbox, MessageSquare, CheckCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Types & Data ─────────────────────────────────────────────────────────────

export type Status = "PENDING" | "ANSWERED" | "DELETED";

export interface Inquiry {
  id: number;
  category: string;
  title: string;
  secret: boolean;
  hasAttachment: boolean;
  author: string;
  status: Status;
  createdAt: string;
  content: string;
  answer?: string;
  answeredAt?: string;
  answeredBy?: string;
}

export const INQUIRIES: Inquiry[] = [
  {
    id: 1042, category: "계정·로그인", title: "소셜 로그인이 안 돼요",
    secret: false, hasAttachment: false, author: "reader_kim", status: "PENDING",
    createdAt: "2026.07.06 14:32",
    content: "카카오 계정으로 로그인하려고 하면 '인증 오류'가 뜨면서 로그인이 안 됩니다. 앱을 재설치해봤지만 동일한 문제가 반복되고 있어요. 빠른 조치 부탁드립니다.",
  },
  {
    id: 1041, category: "도서·도서관", title: "도서관 위치 정보가 틀려요",
    secret: false, hasAttachment: true, author: "book_lover99", status: "ANSWERED",
    createdAt: "2026.07.05 11:20",
    content: "앱에 등록된 마포구립 서강도서관 주소가 실제 주소와 다릅니다. 지도에서도 엉뚱한 곳으로 안내돼서 헤맸어요. 확인 후 수정 부탁드립니다.",
    answer: "안녕하세요, 파노라마북스 운영팀입니다.\n\n불편을 드려 죄송합니다. 말씀하신 마포구립 서강도서관의 주소 정보를 확인하여 정확한 정보로 업데이트 완료하였습니다. 앱을 재시작하시면 정상적으로 반영된 위치를 확인하실 수 있습니다.\n\n감사합니다.",
    answeredAt: "2026.07.05 15:44", answeredBy: "김관리자",
  },
  {
    id: 1040, category: "게시판·콘텐츠", title: "작성한 리뷰가 사라졌어요",
    secret: true, hasAttachment: false, author: "litlover_j", status: "PENDING",
    createdAt: "2026.07.05 09:15",
    content: "어제 작성한 도서 리뷰가 오늘 보니 사라져 있습니다. 별도 삭제 요청을 한 적이 없는데, 운영 측에서 삭제하신 건지 확인하고 싶습니다.",
  },
  {
    id: 1039, category: "기타", title: "닉네임 변경은 어떻게 하나요?",
    secret: false, hasAttachment: false, author: "readmore22", status: "ANSWERED",
    createdAt: "2026.07.04 16:48",
    content: "현재 사용 중인 닉네임을 변경하고 싶은데, 설정 메뉴 어디에서 변경할 수 있는지 찾지 못하겠습니다.",
    answer: "안녕하세요!\n\n닉네임은 [마이페이지 > 프로필 편집 > 닉네임]에서 변경하실 수 있습니다. 닉네임은 30일에 1회만 변경 가능하오니 참고 부탁드립니다.\n\n도움이 되셨으면 좋겠습니다. 감사합니다!",
    answeredAt: "2026.07.04 17:30", answeredBy: "이운영",
  },
  {
    id: 1038, category: "신고·제재", title: "특정 회원을 신고하고 싶어요",
    secret: false, hasAttachment: false, author: "sunflower_r", status: "ANSWERED",
    createdAt: "2026.07.03 13:22",
    content: "특정 회원이 저의 리뷰에 지속적으로 악성 댓글을 달고 있습니다. 해당 회원을 신고하는 방법과 운영팀 조치 여부를 알고 싶습니다.",
    answer: "안녕하세요, 파노라마북스입니다.\n\n불쾌한 경험을 드려 대단히 죄송합니다. 해당 회원의 활동을 검토하여 커뮤니티 가이드라인 위반이 확인될 경우 적절한 조치를 취하도록 하겠습니다. 신고 기능은 해당 댓글 우측 ⋯ 메뉴에서 이용하실 수 있습니다.",
    answeredAt: "2026.07.03 15:10", answeredBy: "김관리자",
  },
  {
    id: 1037, category: "버그·오류", title: "앱이 자꾸 튕겨요",
    secret: false, hasAttachment: true, author: "parkjs_reads", status: "PENDING",
    createdAt: "2026.07.02 20:05",
    content: "도서 검색 화면에서 스크롤을 빠르게 내리면 앱이 강제 종료됩니다. 기기는 아이폰 15 Pro, iOS 17.5입니다. 스크린샷을 첨부합니다.",
  },
  {
    id: 1036, category: "도서·도서관", title: "희망 도서 신청은 어떻게 하나요?",
    secret: false, hasAttachment: false, author: "choi_reader", status: "ANSWERED",
    createdAt: "2026.07.01 10:44",
    content: "제가 읽고 싶은 도서가 앱에 등록되어 있지 않습니다. 희망 도서 신청 제도가 있는지 궁금합니다.",
    answer: "안녕하세요!\n\n희망 도서 신청은 현재 공식적으로 지원되지 않으나, 내부적으로 도서 데이터 확장을 검토 중에 있습니다. 추후 기능이 추가되면 공지사항을 통해 안내드리겠습니다.",
    answeredAt: "2026.07.01 14:20", answeredBy: "이운영",
  },
  {
    id: 1035, category: "게시판·콘텐츠", title: "게시글 수정 후 임시저장이 안 돼요",
    secret: true, hasAttachment: false, author: "lee_books", status: "DELETED",
    createdAt: "2026.06.30 22:11",
    content: "게시글 수정 중 임시저장 버튼을 눌렀는데 저장이 되지 않습니다.",
  },
];

export const CAT_STYLE: Record<string, { bg: string; color: string }> = {
  "계정·로그인":   { bg: "#EFF6FF", color: "#2563EB" },
  "도서·도서관":   { bg: "#F5F3FF", color: "#7C3AED" },
  "게시판·콘텐츠": { bg: "#FFF7ED", color: "#C2410C" },
  "신고·제재":     { bg: "#FFF1F2", color: "#BE123C" },
  "버그·오류":     { bg: "#ECFDF5", color: "#059669" },
  "기타":          { bg: "#F8FAFC", color: "#475569" },
};

export const STAT_STYLE: Record<Status, { bg: string; color: string; label: string }> = {
  PENDING:  { bg: "#FFFBEB", color: "#D97706", label: "답변 대기" },
  ANSWERED: { bg: "#F0FDF4", color: "#15803D", label: "답변 완료" },
  DELETED:  { bg: "#FEF2F2", color: "#DC2626", label: "삭제됨"   },
};

export interface StatCard {
  label: string;
  value: string;
  unit: string;
  sub: string;
  icon: LucideIcon;
  iconBg: string;
  iconClr: string;
  valClr: string;
}

export const STATS: StatCard[] = [
  { label: "답변 대기",      value: "4",   unit: "건",   sub: "즉시 답변 필요",       icon: MessageSquare, iconBg: "#FFFBEB", iconClr: "#D97706", valClr: "#D97706" },
  { label: "답변 완료",      value: "312", unit: "건",   sub: "96.6%",              icon: CheckCheck,    iconBg: "#F0FDF4", iconClr: "#16A34A", valClr: "#16A34A" },
  { label: "오늘 접수",      value: "6",   unit: "건",   sub: "오늘 새로 접수된 문의", icon: Inbox,         iconBg: "#EFF6FF", iconClr: "#3B82F6", valClr: "#111827" },
  { label: "평균 응답 시간", value: "3.2", unit: "시간", sub: "최근 7일 평균",         icon: Clock,         iconBg: "#F9FAFB", iconClr: "#9CA3AF", valClr: "#111827" },
];
