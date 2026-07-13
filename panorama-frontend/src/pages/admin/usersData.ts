// ─── Types ────────────────────────────────────────────────────────────────────
export type Status = "ACTIVE" | "SUSPENDED" | "DELETED";
export type Role = "USER" | "ADMIN";
export type JoinType = "LOCAL" | "GOOGLE" | "KAKAO" | "NAVER";

export interface User {
  id: string; uid: string; name: string; initial: string; color: string;
  joinType: JoinType; role: Role; status: Status;
  joinDate: string; lastLogin: string;
  warnings: number; reports: number; reportsPending: number;
  posts: number; reviews: number; comments: number;
  likes: number; scraps: number; avgRating: number; bookmarks: number;
  suspendedDate?: string; deletedDate?: string;
  deletedBy?: "admin" | "self"; withinRetention?: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
export const USERS: User[] = [
  {
    id: "#3621", uid: "U-008821", name: "책읽는달팽이", initial: "책", color: "#2D6A4F",
    joinType: "LOCAL", role: "USER", status: "ACTIVE",
    joinDate: "2025.02.14", lastLogin: "2026.07.06",
    warnings: 0, reports: 0, reportsPending: 0,
    posts: 42, reviews: 15, comments: 128,
    likes: 810, scraps: 47, avgRating: 4.2, bookmarks: 22,
  },
  {
    id: "#3620", uid: "U-007720", name: "조용한독자", initial: "조", color: "#1D4ED8",
    joinType: "GOOGLE", role: "ADMIN", status: "ACTIVE",
    joinDate: "2024.11.03", lastLogin: "2026.07.06",
    warnings: 2, reports: 1, reportsPending: 0,
    posts: 89, reviews: 34, comments: 256,
    likes: 1240, scraps: 88, avgRating: 4.5, bookmarks: 61,
  },
  {
    id: "#3618", uid: "U-005618", name: "북카페소녀", initial: "북", color: "#6D28D9",
    joinType: "KAKAO", role: "USER", status: "ACTIVE",
    joinDate: "2025.05.22", lastLogin: "2026.07.05",
    warnings: 3, reports: 2, reportsPending: 1,
    posts: 18, reviews: 7, comments: 44,
    likes: 220, scraps: 15, avgRating: 3.8, bookmarks: 9,
  },
  {
    id: "#3817", uid: "U-003817", name: "문학청년", initial: "문", color: "#374151",
    joinType: "NAVER", role: "USER", status: "SUSPENDED",
    joinDate: "2025.05.22", lastLogin: "2026.06.20",
    warnings: 4, reports: 5, reportsPending: 3,
    posts: 27, reviews: 8, comments: 67,
    likes: 310, scraps: 22, avgRating: 3.1, bookmarks: 14,
    suspendedDate: "2025.08.10",
  },
  {
    id: "#3815", uid: "U-003815", name: "책방지킴이", initial: "책", color: "#065F46",
    joinType: "LOCAL", role: "USER", status: "ACTIVE",
    joinDate: "2025.01.30", lastLogin: "2026.07.04",
    warnings: 1, reports: 0, reportsPending: 0,
    posts: 31, reviews: 12, comments: 88,
    likes: 430, scraps: 29, avgRating: 4.0, bookmarks: 18,
  },
  {
    id: "#3813", uid: "U-003813", name: "밤새읽는사람", initial: "밤", color: "#92400E",
    joinType: "GOOGLE", role: "USER", status: "ACTIVE",
    joinDate: "2024.09.08", lastLogin: "2026.07.03",
    warnings: 0, reports: 0, reportsPending: 0,
    posts: 55, reviews: 21, comments: 144,
    likes: 670, scraps: 38, avgRating: 4.3, bookmarks: 27,
  },
  {
    id: "#3811", uid: "U-003811", name: "페이지홀더", initial: "페", color: "#4B5563",
    joinType: "KAKAO", role: "USER", status: "SUSPENDED",
    joinDate: "2025.06.14", lastLogin: "2026.05.31",
    warnings: 2, reports: 3, reportsPending: 2,
    posts: 9, reviews: 2, comments: 23,
    likes: 88, scraps: 5, avgRating: 2.9, bookmarks: 3,
    suspendedDate: "2026.05.31",
  },
  {
    id: "#3808", uid: "U-001808", name: "활자중독자", initial: "활", color: "#6B7280",
    joinType: "NAVER", role: "USER", status: "DELETED",
    joinDate: "2024.12.20", lastLogin: "2026.04.15",
    warnings: 1, reports: 2, reportsPending: 0,
    posts: 33, reviews: 11, comments: 92,
    likes: 420, scraps: 31, avgRating: 3.9, bookmarks: 16,
    deletedDate: "2026.04.11", deletedBy: "self", withinRetention: true,
  },
  {
    id: "#3803", uid: "U-001803", name: "책과나비", initial: "책", color: "#9CA3AF",
    joinType: "LOCAL", role: "USER", status: "DELETED",
    joinDate: "2024.06.05", lastLogin: "2025.11.20",
    warnings: 3, reports: 4, reportsPending: 0,
    posts: 14, reviews: 5, comments: 38,
    likes: 155, scraps: 9, avgRating: 3.2, bookmarks: 7,
    deletedDate: "2026.01.05", deletedBy: "admin", withinRetention: false,
  },
];

export const SAMPLE_POSTS = [
  { category: "추천", title: "한강 작가 신작 함께 읽어요 — \"봄과 실…\"", views: 4821, comments: 63, likes: 217, status: "ACTIVE", date: "2026.07.05" },
  { category: "자유", title: "요즘 읽고 싶은 책 공유해요 (7월 여름 독…)", views: 1872, comments: 28, likes: 94, status: "ACTIVE", date: "2026.07.03" },
  { category: "추천", title: "『채식주의자』 한강 노벨문학상 이후 다…", views: 6320, comments: 88, likes: 341, status: "ACTIVE", date: "2026.07.01" },
  { category: "자유", title: "특정 작가 비방 및 인신공격 댓글 (신고 접…)", views: 208, comments: 14, likes: 2, status: "HIDDEN", date: "2026.06.29" },
  { category: "리뷰", title: "마친로 이민인 — 4대에 걸친 이야기…", views: 920, comments: 7, likes: 156, status: "ACTIVE", date: "2026.06.27" },
];

// ─── Tab Section ──────────────────────────────────────────────────────────────
export const TABS = [
  { id: "overview", label: "개요" },
  { id: "posts", label: "작성 글" },
  { id: "reviews", label: "리뷰" },
  { id: "comments", label: "댓글" },
  { id: "reports", label: "받은 신고", showCount: true },
  { id: "logs", label: "관리자 조치 로그" },
];
