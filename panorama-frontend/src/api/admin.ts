/**
 * 관리자(admin) 도메인 API 함수 + react-query 훅.
 *
 * - 백엔드 매핑: /api/v1/admin/**  (client 의 baseURL 이 이미 /api/v1)
 * - 목록 조회는 대부분 POST(검색 조건 body), 공지 목록만 GET(쿼리).
 * - 성공 목록 응답은 PageResponse<T> 봉투로 내려온다.
 * - 관리자 API 는 admin JWT 가 필요하다(무토큰 시 401). 토큰은 client 인터셉터가 주입한다.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client } from './client'
import { libraryKeys } from './library'
import type { PageResponse } from '@/types/common'
import type {
  DashboardResponse,
  NoticeResponse,
  NoticeDetailResponse,
  NoticeSearchRequest,
  NoticeCreateRequest,
  NoticeImageResponse,
  NoticeUpdateRequest,
  UserResponse,
  UserDetailView,
  UserSearchRequest,
  UserProcessRequest,
  CommunityContentResponse,
  CommunityContentDetailResponse,
  CommunityContentSearchRequest,
  CommunityProcessRequest,
  ContentType,
  ReportResponse,
  ReportDetailResponse,
  ReportSearchRequest,
  ReportProcessRequest,
  ReportBulkProcessRequest,
  BulkResult,
  InquiryResponse,
  InquiryDetailResponse,
  InquirySearchRequest,
  InquiryAnswerCreateRequest,
  InquiryStatusUpdateRequest,
  LibrarySyncResult,
} from '@/types/admin'

// ── queryKey 규칙: ['admin', ...] ────────────────────────────────────────────
export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  notices: (params?: NoticeSearchRequest) => [...adminKeys.all, 'notices', params ?? {}] as const,
  notice: (id: number) => [...adminKeys.all, 'notice', id] as const,
  users: (params?: UserSearchRequest) => [...adminKeys.all, 'users', params ?? {}] as const,
  user: (id: number) => [...adminKeys.all, 'user', id] as const,
  contents: (params?: CommunityContentSearchRequest) => [...adminKeys.all, 'contents', params ?? {}] as const,
  content: (type: ContentType, id: number) => [...adminKeys.all, 'content', type, id] as const,
  reports: (params?: ReportSearchRequest) => [...adminKeys.all, 'reports', params ?? {}] as const,
  report: (id: number) => [...adminKeys.all, 'report', id] as const,
  inquiries: (params?: InquirySearchRequest) => [...adminKeys.all, 'inquiries', params ?? {}] as const,
  inquiry: (id: number) => [...adminKeys.all, 'inquiry', id] as const,
}

// ══ 대시보드 ═══════════════════════════════════════════════════════════════════
export async function getAdminDashboard(): Promise<DashboardResponse> {
  const { data } = await client.get<DashboardResponse>('/admin/dashboard')
  return data
}

export function useAdminDashboard(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: getAdminDashboard,
    enabled: options?.enabled ?? true,
  })
}

// ══ 도서관 데이터 동기화 ═════════════════════════════════════════════════════════
// 정보나루 libSrch 를 전체 페이지 조회해 lib_code 기준 upsert(수동 실행). 처리에 시간이 걸린다.
export async function syncLibraries(): Promise<LibrarySyncResult> {
  // 전체 페이지 조회라 기본 10s 로는 부족 → 이 요청만 타임아웃을 넉넉히(5분) 늘린다.
  const { data } = await client.post<LibrarySyncResult>('/admin/libraries/sync', null, { timeout: 300_000 })
  return data
}

export function useSyncLibraries() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: syncLibraries,
    // 동기화 직후 지도 페이지로 가면 useLibraries 의 staleTime(5분) 때문에 예전 목록을 본다.
    // 방금 동기화한 사람에게는 "반영이 안 됐다"로 읽히므로 여기서 바로 무효화한다.
    onSuccess: () => qc.invalidateQueries({ queryKey: libraryKeys.all }),
  })
}

// ══ 공지 관리 ═══════════════════════════════════════════════════════════════════
export async function getAdminNotices(params: NoticeSearchRequest = {}): Promise<PageResponse<NoticeResponse>> {
  const { data } = await client.get<PageResponse<NoticeResponse>>('/admin/notices', { params })
  return data
}

export async function getAdminNotice(noticeId: number): Promise<NoticeDetailResponse> {
  const { data } = await client.get<NoticeDetailResponse>(`/admin/notices/${noticeId}`)
  return data
}

export async function createAdminNotice(body: NoticeCreateRequest): Promise<NoticeResponse> {
  const { data } = await client.post<NoticeResponse>('/admin/notices', body)
  return data
}

export async function updateAdminNotice(noticeId: number, body: NoticeUpdateRequest): Promise<NoticeDetailResponse> {
  const { data } = await client.put<NoticeDetailResponse>(`/admin/notices/${noticeId}`, body)
  return data
}

export function useAdminNotices(params: NoticeSearchRequest = {}) {
  return useQuery({ queryKey: adminKeys.notices(params), queryFn: () => getAdminNotices(params) })
}

export function useAdminNotice(noticeId: number | null) {
  return useQuery({
    queryKey: adminKeys.notice(noticeId ?? 0),
    queryFn: () => getAdminNotice(noticeId as number),
    enabled: noticeId != null,
  })
}

export function useCreateNotice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: NoticeCreateRequest) => createAdminNotice(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...adminKeys.all, 'notices'] }),
  })
}

export function useUpdateNotice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ noticeId, body }: { noticeId: number; body: NoticeUpdateRequest }) =>
      updateAdminNotice(noticeId, body),
    onSuccess: (_res, { noticeId }) => {
      qc.invalidateQueries({ queryKey: [...adminKeys.all, 'notices'] })
      qc.invalidateQueries({ queryKey: adminKeys.notice(noticeId) })
    },
  })
}

// ══ 사용자 관리 ═════════════════════════════════════════════════════════════════
export async function getAdminUsers(body: UserSearchRequest = {}): Promise<PageResponse<UserResponse>> {
  const { data } = await client.post<PageResponse<UserResponse>>('/admin/users', body)
  return data
}

export async function getAdminUser(userId: number): Promise<UserDetailView> {
  const { data } = await client.get<UserDetailView>(`/admin/users/${userId}`)
  return data
}

export async function processAdminUser(userId: number, body: UserProcessRequest): Promise<void> {
  await client.patch(`/admin/users/${userId}/process`, body)
}

// ══ 콘텐츠(커뮤니티) 관리 ═══════════════════════════════════════════════════════
export async function getAdminContents(
  body: CommunityContentSearchRequest = {},
): Promise<PageResponse<CommunityContentResponse>> {
  const { data } = await client.post<PageResponse<CommunityContentResponse>>('/admin/communities', body)
  return data
}

export async function getAdminContent(
  contentType: ContentType,
  contentId: number,
): Promise<CommunityContentDetailResponse> {
  const { data } = await client.get<CommunityContentDetailResponse>(`/admin/communities/${contentType}/${contentId}`)
  return data
}

export async function processAdminContent(
  contentType: ContentType,
  contentId: number,
  body: CommunityProcessRequest,
): Promise<void> {
  await client.patch(`/admin/communities/${contentType}/${contentId}/process`, body)
}

// ══ 신고 관리 ═══════════════════════════════════════════════════════════════════
export async function getAdminReports(body: ReportSearchRequest = {}): Promise<PageResponse<ReportResponse>> {
  const { data } = await client.post<PageResponse<ReportResponse>>('/admin/reports', body)
  return data
}

export async function getAdminReport(reportId: number): Promise<ReportDetailResponse> {
  const { data } = await client.get<ReportDetailResponse>(`/admin/reports/${reportId}`)
  return data
}

/**
 * 공지 본문 이미지 업로드. 게시글의 /posts/images 와 달리 /admin 아래라 ADMIN 권한이 필요하다.
 * 공지를 저장하기 전에 호출되므로 서버에는 소유자 없는 이미지로 들어간다.
 */
export async function uploadNoticeImages(files: File[] | Blob[]): Promise<NoticeImageResponse[]> {
  const form = new FormData()
  files.forEach(file => form.append('images', file))
  const { data } = await client.post<NoticeImageResponse[]>('/admin/notices/images', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function processAdminReport(reportId: number, body: ReportProcessRequest): Promise<void> {
  await client.patch(`/admin/reports/${reportId}/process`, body)
}

export async function bulkProcessReports(body: ReportBulkProcessRequest): Promise<BulkResult> {
  const { data } = await client.patch<BulkResult>('/admin/reports/process', body)
  return data
}

// ══ 문의 관리 ═══════════════════════════════════════════════════════════════════
export async function getAdminInquiries(body: InquirySearchRequest = {}): Promise<PageResponse<InquiryResponse>> {
  const { data } = await client.post<PageResponse<InquiryResponse>>('/admin/inquiries', body)
  return data
}

export async function getAdminInquiry(inquiryId: number): Promise<InquiryDetailResponse> {
  const { data } = await client.get<InquiryDetailResponse>(`/admin/inquiries/${inquiryId}`)
  return data
}

export async function answerInquiry(inquiryId: number, body: InquiryAnswerCreateRequest): Promise<number> {
  const { data } = await client.post<number>(`/admin/inquiries/${inquiryId}/answers`, body)
  return data
}

export async function updateInquiryStatus(inquiryId: number, body: InquiryStatusUpdateRequest): Promise<void> {
  await client.patch(`/admin/inquiries/${inquiryId}/status`, body)
}

// ══ 훅: 사용자 ═══════════════════════════════════════════════════════════════════
export function useAdminUsers(params: UserSearchRequest = {}) {
  return useQuery({ queryKey: adminKeys.users(params), queryFn: () => getAdminUsers(params) })
}
export function useAdminUser(userId: number | null) {
  return useQuery({
    queryKey: adminKeys.user(userId ?? 0),
    queryFn: () => getAdminUser(userId as number),
    enabled: userId != null,
  })
}
export function useProcessUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, body }: { userId: number; body: UserProcessRequest }) => processAdminUser(userId, body),
    onSuccess: (_r, { userId }) => {
      qc.invalidateQueries({ queryKey: [...adminKeys.all, 'users'] })
      qc.invalidateQueries({ queryKey: adminKeys.user(userId) })
    },
  })
}

// ══ 훅: 콘텐츠 ═══════════════════════════════════════════════════════════════════
export function useAdminContents(params: CommunityContentSearchRequest = {}) {
  return useQuery({ queryKey: adminKeys.contents(params), queryFn: () => getAdminContents(params) })
}
export function useAdminContent(contentType: ContentType | null, contentId: number | null) {
  return useQuery({
    queryKey: adminKeys.content(contentType as ContentType, contentId ?? 0),
    queryFn: () => getAdminContent(contentType as ContentType, contentId as number),
    enabled: contentType != null && contentId != null,
  })
}
export function useProcessContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ contentType, contentId, body }: { contentType: ContentType; contentId: number; body: CommunityProcessRequest }) =>
      processAdminContent(contentType, contentId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...adminKeys.all, 'contents'] }),
  })
}

// ══ 훅: 신고 ═════════════════════════════════════════════════════════════════════
export function useAdminReports(params: ReportSearchRequest = {}) {
  return useQuery({ queryKey: adminKeys.reports(params), queryFn: () => getAdminReports(params) })
}
export function useAdminReport(reportId: number | null) {
  return useQuery({
    queryKey: adminKeys.report(reportId ?? 0),
    queryFn: () => getAdminReport(reportId as number),
    enabled: reportId != null,
  })
}
export function useProcessReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reportId, body }: { reportId: number; body: ReportProcessRequest }) => processAdminReport(reportId, body),
    onSuccess: (_r, { reportId }) => {
      qc.invalidateQueries({ queryKey: [...adminKeys.all, 'reports'] })
      // 목록 키는 'reports', 상세 키는 'report' 라 위 무효화에 안 걸린다. 상세를 열어둔 채
      // 처리하는 흐름이 생겼으므로 상세도 명시적으로 무효화한다.
      qc.invalidateQueries({ queryKey: adminKeys.report(reportId) })
    },
  })
}
export function useBulkProcessReports() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ReportBulkProcessRequest) => bulkProcessReports(body),
    onSuccess: (_r, { reportIds }) => {
      qc.invalidateQueries({ queryKey: [...adminKeys.all, 'reports'] })
      reportIds.forEach(id => qc.invalidateQueries({ queryKey: adminKeys.report(id) }))
    },
  })
}

// ══ 훅: 문의 ═════════════════════════════════════════════════════════════════════
export function useAdminInquiries(params: InquirySearchRequest = {}) {
  return useQuery({ queryKey: adminKeys.inquiries(params), queryFn: () => getAdminInquiries(params) })
}
export function useAdminInquiry(inquiryId: number | null) {
  return useQuery({
    queryKey: adminKeys.inquiry(inquiryId ?? 0),
    queryFn: () => getAdminInquiry(inquiryId as number),
    enabled: inquiryId != null,
  })
}
export function useAnswerInquiry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ inquiryId, body }: { inquiryId: number; body: InquiryAnswerCreateRequest }) => answerInquiry(inquiryId, body),
    onSuccess: (_r, { inquiryId }) => {
      qc.invalidateQueries({ queryKey: [...adminKeys.all, 'inquiries'] })
      qc.invalidateQueries({ queryKey: adminKeys.inquiry(inquiryId) })
    },
  })
}
export function useUpdateInquiryStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ inquiryId, body }: { inquiryId: number; body: InquiryStatusUpdateRequest }) => updateInquiryStatus(inquiryId, body),
    onSuccess: (_r, { inquiryId }) => {
      qc.invalidateQueries({ queryKey: [...adminKeys.all, 'inquiries'] })
      qc.invalidateQueries({ queryKey: adminKeys.inquiry(inquiryId) })
    },
  })
}
