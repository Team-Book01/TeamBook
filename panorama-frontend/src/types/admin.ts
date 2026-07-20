/**
 * 관리자(admin) 도메인 타입. 백엔드 domain/admin DTO(OpenAPI /v3/api-docs) 기준 수기 동기화.
 * @see src/api/admin.ts
 *
 * 규칙(공통 common.ts): 성공 목록 응답은 PageResponse<T>, 에러는 ErrorResponse.
 * enum 값은 백엔드 그대로(영문 대문자) 두고, 화면 표기(한글)는 각 페이지의 라벨 맵에서 변환한다.
 */

// ── 공통 enum ────────────────────────────────────────────────────────────────
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED'
export type UserRole = 'USER' | 'ADMIN'
export type Provider = 'LOCAL' | 'GOOGLE' | 'NAVER' | 'KAKAO'

export type ContentType = 'POST' | 'COMMENT' | 'REVIEW'
export type ContentStatus = 'ACTIVE' | 'HIDDEN' | 'DELETED'
/** 관리자가 콘텐츠에 취하는 조치. ACTIVE 는 숨김 해제(되돌리기)로 HIDDEN 상태에서만 허용된다. */
export type ContentAction = 'ACTIVE' | 'HIDDEN' | 'DELETED'

export type ReportTargetType = 'POST' | 'COMMENT' | 'REVIEW' | 'USER'
export type ReportReason = 'ABUSE' | 'SPAM' | 'MISINFO' | 'OBSCENE' | 'ETC'
export type ReportStatus = 'PENDING' | 'RESOLVED' | 'REJECTED'

export type InquiryStatus = 'PENDING' | 'ANSWERED' | 'CLOSED' | 'DELETED'

export type NoticeCategory = 'GENERAL' | 'EVENT' | 'UPDATE' | 'MAINTENANCE'
export type NoticeStatus = 'ACTIVE' | 'HIDDEN' | 'DELETED'

export type PostCategory = 'RECOMMEND' | 'REVIEW' | 'FREE'

// ── 대시보드 ─────────────────────────────────────────────────────────────────
export interface DashboardStatsResponse {
  totalUsers: number
  newUsersThisWeek: number
  todayVisitors: number
  totalPosts: number
  newPostsToday: number
  pendingReports: number
  pendingInquiries: number
}

export interface PendingInquiryResponse {
  inquiryId: number
  category: string
  title: string
  writerNickname: string
  createdAt: string
}

export interface RecentContentResponse {
  postId: number
  category: PostCategory
  title: string
  authorNickname: string
  createdAt: string
}

export interface DashboardResponse {
  stats: DashboardStatsResponse
  pendingReports: ReportResponse[]
  pendingInquiries: PendingInquiryResponse[]
  recentContents: RecentContentResponse[]
}

// ── 도서관 데이터 동기화 ──────────────────────────────────────────────────────
// 정보나루(data4library) libSrch 를 전체 조회해 lib_code 기준 upsert 한 결과.
export interface LibrarySyncResult {
  processed: number // DB 반영 총 건수(insert + update)
  inserted: number // 신규
  updated: number // 수정
  skipped: number // 필수값 누락·데이터 오류로 저장 안 함
  removed: number // 그중 이전에 저장돼 있어 삭제한 건수
  syncedAt: string // 완료 시각(ISO)
}

// ── 사용자 관리 ──────────────────────────────────────────────────────────────
export interface UserResponse {
  userId: number
  loginId: string | null
  nickname: string
  provider: Provider
  role: UserRole
  status: UserStatus
  createdAt: string
}

export interface UserDetailResponse {
  userId: number
  loginId: string | null
  nickname: string
  email: string
  provider: Provider
  role: UserRole
  status: UserStatus
  reportReceivedCount: number
  createdAt: string
  updatedAt: string
}

export interface UserSearchRequest {
  searchString?: string
  status?: UserStatus
  role?: UserRole
  provider?: Provider
  page?: number
  size?: number
}

export interface UserProcessRequest {
  action: 'SUSPEND' | 'ACTIVATE' | 'DELETE'
  reason?: string
  handlerUserId: number
}

// ── 콘텐츠(커뮤니티) 관리 ────────────────────────────────────────────────────
export interface CommunityContentResponse {
  contentType: ContentType
  contentId: number
  authorUserId: number
  authorNickname: string
  title: string | null
  contentSummary: string
  status: ContentStatus
  createdAt: string
  reportCount: number
}

export interface CommunityContentDetailResponse {
  contentType: ContentType
  contentId: number
  authorUserId: number
  authorNickname: string
  title: string | null
  content: string
  status: ContentStatus
  parentPostId: number | null
  bookId: number | null
  category: string | null
  reportCount: number
  createdAt: string
  updatedAt: string
}

export interface CommunityContentSearchRequest {
  contentType?: ContentType
  status?: ContentStatus
  searchString?: string
  page?: number
  size?: number
}

export interface CommunityProcessRequest {
  action: ContentAction
  reason?: string
  handlerUserId: number
}

// ── 신고 관리 ────────────────────────────────────────────────────────────────
export interface ReportResponse {
  reportId: number
  targetType: ReportTargetType
  targetId: number
  targetSummary: string | null
  reasonType: ReportReason
  status: ReportStatus
  reporterNickname: string
  createdAt: string
}

export interface ReportCore {
  reportId: number
  reporterUserId: number
  reporterNickname: string
  targetType: ReportTargetType
  targetId: number
  reasonType: ReportReason
  content: string
  status: ReportStatus
  handlerUserId: number | null
  handlerNickname: string | null
  processedAt: string | null
  /** 관리자가 남긴 처리 사유. 신고자가 고른 reasonType 과 다르다. */
  processReason: string | null
  createdAt: string
  updatedAt: string
}

export interface ReportTargetView {
  targetType: ReportTargetType
  targetId: number
  content: string | null
  authorNickname: string
  createdAt: string
  status: string
  deleted: boolean
  /** 원본으로 이동할 링크의 재료. POST=자기 자신, COMMENT=부모 글, REVIEW·USER=null */
  linkPostId: number | null
}

export interface RelatedReport {
  reportId: number
  reasonType: ReportReason
  status: ReportStatus
  createdAt: string
}

export interface ReportDetailResponse {
  report: ReportCore
  target: ReportTargetView | null
  relatedReports: RelatedReport[]
}

export interface ReportSearchRequest {
  searchString?: string
  targetType?: ReportTargetType
  reasonType?: ReportReason
  status?: ReportStatus
  includeAll?: boolean
  reporterUserId?: number
  startAt?: string
  endAt?: string
  page?: number
  size?: number
}

export interface ReportProcessRequest {
  action: 'HIDDEN' | 'DELETED'
  reason?: string
  handlerUserId: number
}

export interface ReportBulkProcessRequest {
  reportIds: number[]
  status: ReportStatus
  reason?: string
  handlerUserId: number
}

export interface BulkResult {
  done: number
  skipped: number
}

// ── 문의 관리 ────────────────────────────────────────────────────────────────
export interface InquiryImageResponse {
  inquiryImageId: number
  inquiryId: number
  imageUrl: string
  imageKey: string
  originalFileName: string
  contentType: string
  fileSize: number
  sortOrder: number
  createdAt: string
}

export interface InquiryResponse {
  inquiryId: number
  userId: number
  category: string
  title: string
  content: string
  status: InquiryStatus
  images: InquiryImageResponse[]
  createdAt: string
  updatedAt: string
}

export interface InquiryAnswerResponse {
  inquiryAnswerId: number
  inquiryId: number
  userId: number
  content: string
  createdAt: string
  updatedAt: string
}

export interface InquiryDetailResponse {
  inquiry: InquiryResponse
  answers: InquiryAnswerResponse[]
}

export interface InquirySearchRequest {
  searchString?: string
  category?: string
  status?: InquiryStatus
  userId?: number
  startAt?: string
  endAt?: string
  page?: number
  size?: number
}

export interface InquiryAnswerCreateRequest {
  userId: number
  content?: string
}

export interface InquiryStatusUpdateRequest {
  status: InquiryStatus
}

// ── 공지 관리 ────────────────────────────────────────────────────────────────
export interface NoticeResponse {
  noticeId: number
  userId: number
  category: NoticeCategory
  title: string
  content: string
  pinned: boolean
  important: boolean
  status: NoticeStatus
  createdAt: string
  updatedAt: string
}

export interface NoticeDetailResponse {
  noticeId: number
  userId: number
  category: NoticeCategory
  title: string
  content: string
  pinned: boolean
  important: boolean
  viewCount: number
  status: NoticeStatus
  nickname: string
  createdAt: string
  updatedAt: string
}

export interface NoticeSearchRequest {
  searchString?: string
  category?: NoticeCategory
  status?: 'ACTIVE' | 'DELETED'
  page?: number
  size?: number
}

export interface NoticeCreateRequest {
  userId: number
  category: NoticeCategory
  title?: string
  content?: string
  pinned?: boolean
  important?: boolean
  viewCount?: number
  status?: NoticeStatus
}

export interface NoticeUpdateRequest {
  category: NoticeCategory
  title?: string
  content?: string
  pinned?: boolean
  important?: boolean
}

// ── 도서관 동기화 ────────────────────────────────────────────────────────────
export interface LibrarySyncResult {
  processed: number
  inserted: number
  updated: number
  skipped: number
  syncedAt: string
}
