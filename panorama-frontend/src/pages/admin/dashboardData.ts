import {
  Users,
  Activity,
  FileText,
  Flag,
  MessageSquare,
  Star,
  ScrollText,
  type LucideIcon,
} from 'lucide-react'

// ── KPI ────────────────────────────────────────────────────────────────────
export interface KpiCard {
  icon: LucideIcon
  label: string
  value: string
  sub: string
  color: string
  bg: string
  trend: string
  urgent?: boolean
  warn?: boolean
}

export const KPI_CARDS: KpiCard[] = [
  {
    icon: Users,
    label: '전체 회원',
    value: '12,480',
    sub: '명',
    color: 'text-[#1e4a38]',
    bg: 'bg-[#eaf2ee]',
    trend: '+128 이번 주',
  },
  {
    icon: Activity,
    label: '오늘 방문자',
    value: '3,291',
    sub: '명',
    color: 'text-[#2e7d6b]',
    bg: 'bg-[#e6f4f1]',
    trend: '현재 활성',
  },
  {
    icon: FileText,
    label: '전체 게시글',
    value: '14,320',
    sub: '건',
    color: 'text-[#6b9bd1]',
    bg: 'bg-[#eaf0f9]',
    trend: '+47 오늘',
  },
  {
    icon: Flag,
    label: '신고 대기',
    value: '7',
    sub: '건',
    color: 'text-[#d9534f]',
    bg: 'bg-red-50',
    trend: '즉시 처리 필요',
    urgent: true,
  },
  {
    icon: MessageSquare,
    label: '문의 대기',
    value: '4',
    sub: '건',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    trend: '답변 대기 중',
    warn: true,
  },
]

// ── Chart data ──────────────────────────────────────────────────────────────
export interface VisitorDatum {
  date: string
  visitors: number
}

export const VISITOR_DATA: VisitorDatum[] = [
  { date: '6/27', visitors: 2840 },
  { date: '6/28', visitors: 3120 },
  { date: '6/29', visitors: 2670 },
  { date: '6/30', visitors: 3480 },
  { date: '7/01', visitors: 3190 },
  { date: '7/02', visitors: 3540 },
  { date: '7/03', visitors: 3291 },
]

export interface ContentDatum {
  date: string
  게시글: number
  리뷰: number
  독후감: number
}

export const CONTENT_DATA: ContentDatum[] = [
  { date: '6/27', 게시글: 38, 리뷰: 14, 독후감: 7 },
  { date: '6/28', 게시글: 52, 리뷰: 19, 독후감: 11 },
  { date: '6/29', 게시글: 41, 리뷰: 16, 독후감: 8 },
  { date: '6/30', 게시글: 67, 리뷰: 22, 독후감: 14 },
  { date: '7/01', 게시글: 59, 리뷰: 20, 독후감: 10 },
  { date: '7/02', 게시글: 73, 리뷰: 25, 독후감: 17 },
  { date: '7/03', 게시글: 47, 리뷰: 18, 독후감: 9 },
]

// ── Pending data ────────────────────────────────────────────────────────────
export interface PendingItem {
  type: string
  typeBg: string
  content: string
  target: string
  reporter: string
  time: string
}

export const REPORTS: PendingItem[] = [
  {
    type: '욕설/비방',
    typeBg: 'bg-red-100 text-red-700',
    content: '"쓰레기같은 책 추천하지마라" — 댓글',
    target: '독서토론 > 채식주의자',
    reporter: 'kim****',
    time: '12분 전',
  },
  {
    type: '스팸',
    typeBg: 'bg-purple-100 text-purple-700',
    content: '동일 내용 반복 게시 (10회 이상)',
    target: '자유게시판 > lee****',
    reporter: 'park****',
    time: '34분 전',
  },
  {
    type: '허위정보',
    typeBg: 'bg-blue-100 text-blue-700',
    content: '"이 책은 절판됐습니다" — 사실 아님',
    target: '도서 리뷰 > 82년생 김지영',
    reporter: 'choi****',
    time: '1시간 전',
  },
  {
    type: '욕설/비방',
    typeBg: 'bg-red-100 text-red-700',
    content: '특정 작가 비하 및 인신공격 댓글',
    target: '작가소개 > 한강',
    reporter: 'jung****',
    time: '2시간 전',
  },
  {
    type: '스팸',
    typeBg: 'bg-purple-100 text-purple-700',
    content: '이벤트 링크 대량 살포 (DM 포함)',
    target: '독서모임 > 고전읽기',
    reporter: 'yoon****',
    time: '3시간 전',
  },
]

export const INQUIRIES: PendingItem[] = [
  {
    type: '계정 문의',
    typeBg: 'bg-blue-100 text-blue-700',
    content: '로그인 후 프로필 사진이 변경되지 않아요',
    target: '회원 lee****',
    reporter: '',
    time: '8분 전',
  },
  {
    type: '결제 문의',
    typeBg: 'bg-amber-100 text-amber-700',
    content: '프리미엄 구독 해지 후에도 요금 청구됨',
    target: '회원 moon****',
    reporter: '',
    time: '22분 전',
  },
  {
    type: '기능 문의',
    typeBg: 'bg-purple-100 text-purple-700',
    content: '독서 모임 모집 글 수정 방법을 모르겠어요',
    target: '회원 shin****',
    reporter: '',
    time: '1시간 전',
  },
  {
    type: '신고 문의',
    typeBg: 'bg-red-100 text-red-700',
    content: '신고한 게시글이 아직 처리되지 않았습니다',
    target: '회원 oh****',
    reporter: '',
    time: '3시간 전',
  },
  {
    type: '계정 문의',
    typeBg: 'bg-blue-100 text-blue-700',
    content: '비밀번호 재설정 메일이 오지 않습니다',
    target: '회원 han****',
    reporter: '',
    time: '4시간 전',
  },
]

// ── Recent content ──────────────────────────────────────────────────────────
export interface RecentContentItem {
  typeLabel: string
  typeBg: string
  icon: LucideIcon
  title: string
  author: string
  time: string
}

export const RECENT_CONTENT: RecentContentItem[] = [
  {
    typeLabel: '게시글',
    typeBg: 'bg-[#eaf0f9] text-[#6b9bd1]',
    icon: FileText,
    title: '봄에 읽기 좋은 소설 추천 10선',
    author: 'park****',
    time: '3분 전',
  },
  {
    typeLabel: '리뷰',
    typeBg: 'bg-[#eaf2ee] text-[#2e7d6b]',
    icon: Star,
    title: '채식주의자 — 한강의 언어는 왜 아픈가',
    author: 'kim****',
    time: '17분 전',
  },
  {
    typeLabel: '독후감',
    typeBg: 'bg-purple-50 text-purple-600',
    icon: ScrollText,
    title: '82년생 김지영을 읽고 느낀 점',
    author: 'lee****',
    time: '29분 전',
  },
  {
    typeLabel: '게시글',
    typeBg: 'bg-[#eaf0f9] text-[#6b9bd1]',
    icon: FileText,
    title: '이번 달 독서 모임 후기 — 노르웨이의 숲',
    author: 'choi****',
    time: '51분 전',
  },
  {
    typeLabel: '리뷰',
    typeBg: 'bg-[#eaf2ee] text-[#2e7d6b]',
    icon: Star,
    title: '코스모스 — 칼 세이건이 남긴 유산',
    author: 'jung****',
    time: '1시간 전',
  },
]

// ── Recent members ──────────────────────────────────────────────────────────
export interface RecentMember {
  name: string
  email: string
  time: string
  avatar: string
}

export const RECENT_MEMBERS: RecentMember[] = [
  { name: '박서연', email: 'seo****@naver.com', time: '방금 전', avatar: '박' },
  { name: '최민준', email: 'min****@kakao.com', time: '15분 전', avatar: '최' },
  { name: '이수아', email: 'sua****@gmail.com', time: '41분 전', avatar: '이' },
  { name: '김도현', email: 'doh****@naver.com', time: '1시간 전', avatar: '김' },
  { name: '오지훈', email: 'jih****@naver.com', time: '2시간 전', avatar: '오' },
]

export const AVATAR_COLORS: string[] = ['#1e4a38', '#2e7d6b', '#6b9bd1', '#9b8bc4', '#f5c451']
