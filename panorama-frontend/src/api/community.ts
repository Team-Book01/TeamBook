/**
 * 커뮤니티(community) 도메인 API 함수 + TanStack Query 훅. (community 담당자 작업 영역)
 *
 * 구조 원칙 (src/api/book.ts, src/api/README.md 준수)
 * - API 함수는 "얇게": axios 호출 + 반환만.
 * - 조회는 useQuery/useInfiniteQuery, 변경은 useMutation + invalidate.
 * - 백엔드는 전 엔드포인트 인증 필요(JWT). 토큰 주입/401 재발급은 client.ts 인터셉터가 처리.
 */
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { client } from './client'
import { useAuthStore } from '@/store/authStore'
import type {
  PostCategory,
  PostComment,
  PostCommentRequest,
  PostCommentResponse,
  PostDetail,
  PostImage,
  PostLikeResponse,
  PostRequest,
  PostResponse,
  PostScrapResponse,
  PostSummary,
  ReportReasonType,
  ReportRequest,
  SliceResponse,
} from '@/types/community'

// ── 상수: 카테고리 enum ↔ 한국어 라벨 (백엔드 PostCategory enum 기준) ─────────
export const POST_CATEGORIES = ['RECOMMEND', 'REVIEW', 'FREE'] as const

export const POST_CATEGORY_LABEL: Record<PostCategory, string> = {
  RECOMMEND: '추천',
  REVIEW: '독후감',
  FREE: '자유',
}

/** 한국어 라벨 → enum (탭 라벨 등에서 역변환할 때 사용) */
export const POST_CATEGORY_BY_LABEL: Record<string, PostCategory> = {
  추천: 'RECOMMEND',
  독후감: 'REVIEW',
  자유: 'FREE',
}

/** 목록/댓글 기본 페이지 크기 (백엔드 @PageableDefault(size = 10) 와 동일) */
export const POST_PAGE_SIZE = 10

// ── 상수: 신고 사유 enum ↔ 한국어 라벨 (백엔드 ReasonType enum 기준) ─────────
export const REPORT_REASONS: { value: ReportReasonType; label: string }[] = [
  { value: 'ABUSE', label: '욕설·비방' },
  { value: 'SPAM', label: '스팸·광고' },
  { value: 'MISINFO', label: '허위 정보' },
  { value: 'OBSCENE', label: '음란성' },
  { value: 'ETC', label: '기타' },
]

/**
 * 게시글 이미지 URL 보정.
 * 업로드 응답의 imageUrl 은 "/images/uuid.png" 형태의 백엔드(8080) 오리진 기준 경로라서,
 * 프론트(5173)에서 그대로 쓰면 404 가 난다 → API 오리진을 접두해 절대 URL 로 만든다.
 */
export function toApiImageUrl(imageUrl: string): string {
  if (/^https?:\/\//.test(imageUrl)) return imageUrl
  const base = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'
  // baseURL 이 절대주소면 그 오리진(http://localhost:8080)을, 상대(proxy)면 8080 을 기본값으로 사용
  const origin = /^https?:\/\//.test(base) ? new URL(base).origin : 'http://localhost:8080'
  return origin + imageUrl
}

// ── queryKey 규칙: ['community', ...] ────────────────────────────────────────
/**
 * 응답이 "요청 사용자"에 따라 달라지는 쿼리(detail 의 liked·scrapped, myScraps)는
 * 키 끝에 viewerId 를 붙여 계정별로 캐시를 분리한다.
 *
 * 안 붙이면 A 로그아웃 → B 로그인 시(같은 탭, gcTime 5분 이내) B 가 A 의 캐시를 그대로
 * 받아 좋아요/스크랩 버튼이 눌린 상태로 보인다. staleTime 60초 동안은 재요청도 안 하므로
 * 화면상으로는 계속 A 의 상태다.
 *
 * 사용자 무관 쿼리(list·popular·comments)는 계정별로 나눌 이유가 없어 그대로 둔다.
 */
export const communityKeys = {
  all: ['community'] as const,
  lists: () => [...communityKeys.all, 'list'] as const,
  // category 를 키에 포함해야 탭마다 캐시·페이지 커서가 분리된다 (없으면 전체 탭 커서를 공유)
  list: (size: number, category?: PostCategory) =>
    [...communityKeys.lists(), { size, category: category ?? null }] as const,
  popular: (size: number) => [...communityKeys.all, 'popular', { size }] as const,
  details: (postId: number) => [...communityKeys.all, 'detail', postId] as const,
  detail: (postId: number, viewerId: ViewerId) =>
    [...communityKeys.details(postId), viewerId] as const,
  comments: (postId: number) => [...communityKeys.all, 'comments', postId] as const,
  myScraps: (size: number, viewerId: ViewerId) =>
    [...communityKeys.all, 'myScraps', { size }, viewerId] as const,
  myPosts: (size: number, viewerId: ViewerId) =>
    [...communityKeys.all, 'myPosts', { size }, viewerId] as const,
  myStats: (viewerId: ViewerId) => [...communityKeys.all, 'myStats', viewerId] as const,
}

/** 비로그인 상태도 하나의 캐시 스코프로 다룬다(서버는 liked·scrapped 를 false 로 준다). */
type ViewerId = number | 'guest'

/**
 * 현재 로그인 사용자 id (쿼리 키 스코프용).
 * 스토어 구독이라 로그인/로그아웃 시 키가 바뀌고 → 훅이 새 키로 재조회한다.
 */
function useViewerId(): ViewerId {
  return useAuthStore((s) => s.user?.id ?? 'guest')
}

/**
 * 세션 복원(reissue) 완료 여부. viewerId 스코프 쿼리는 이게 true 가 될 때까지 기다려야 한다.
 *
 * 새로고침 직후엔 user 가 null 이라 viewerId 가 'guest' → 복원되면 실제 id 로 키가 바뀐다.
 * 기다리지 않으면 두 키로 각각 조회하게 되는데, GET /posts/{id} 는 조회수를 +1 하므로
 * 새로고침 한 번에 조회수가 2 오른다.
 */
function useAuthReady(): boolean {
  return useAuthStore((s) => s.authReady)
}

// ═══════════════════════════════════════════════════════════════════════════
//  API 함수 (얇게)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/v1/posts — 게시글 목록 (Slice, page 는 0부터)
 * category 를 넘기면 서버가 해당 카테고리만 필터해서 페이징한다(미지정 시 전체).
 */
export async function getPosts(
  page = 0,
  size = POST_PAGE_SIZE,
  category?: PostCategory,
): Promise<SliceResponse<PostSummary>> {
  const { data } = await client.get<SliceResponse<PostSummary>>('/posts', {
    params: { page, size, ...(category ? { category } : {}) },
  })
  return data
}

/** GET /api/v1/posts/popular — 인기글 목록 (좋아요 3개 이상 ACTIVE 최신순) */
export async function getPopularPosts(page = 0, size = POST_PAGE_SIZE): Promise<SliceResponse<PostSummary>> {
  const { data } = await client.get<SliceResponse<PostSummary>>('/posts/popular', {
    params: { page, size },
  })
  return data
}

/** GET /api/v1/posts/{id} — 게시글 상세 (호출 시 조회수 +1) */
export async function getPost(postId: number): Promise<PostDetail> {
  const { data } = await client.get<PostDetail>(`/posts/${postId}`)
  return data
}

/** POST /api/v1/posts — 게시글 작성 → 201 { postId } */
export async function createPost(body: PostRequest): Promise<PostResponse> {
  const { data } = await client.post<PostResponse>('/posts', body)
  return data
}

/** PUT /api/v1/posts/{id} — 게시글 수정 (imageKeys 는 서버가 무시) */
export async function updatePost(postId: number, body: PostRequest): Promise<PostResponse> {
  const { data } = await client.put<PostResponse>(`/posts/${postId}`, body)
  return data
}

/** DELETE /api/v1/posts/{id} — 게시글 삭제 → 204 */
export async function deletePost(postId: number): Promise<void> {
  await client.delete(`/posts/${postId}`)
}

/**
 * POST /api/v1/posts/images — 이미지 업로드 (multipart, part 이름 "images", 다건 가능).
 * 응답 imageUrl 은 8080 오리진 기준 경로 → 표시할 땐 toApiImageUrl 로 보정.
 */
export async function uploadPostImages(files: File[] | Blob[]): Promise<PostImage[]> {
  const form = new FormData()
  files.forEach((file) => form.append('images', file))
  const { data } = await client.post<PostImage[]>('/posts/images', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

/** POST /api/v1/posts/{postId}/like — 좋아요 (중복 시 409 P003) */
export async function likePost(postId: number): Promise<PostLikeResponse> {
  const { data } = await client.post<PostLikeResponse>(`/posts/${postId}/like`)
  return data
}

/** DELETE /api/v1/posts/{postId}/like — 좋아요 취소 (멱등, 항상 200) */
export async function unlikePost(postId: number): Promise<PostLikeResponse> {
  const { data } = await client.delete<PostLikeResponse>(`/posts/${postId}/like`)
  return data
}

/** POST /api/v1/posts/{postId}/scrap — 스크랩 (중복 시 409 P004) */
export async function scrapPost(postId: number): Promise<PostScrapResponse> {
  const { data } = await client.post<PostScrapResponse>(`/posts/${postId}/scrap`)
  return data
}

/** DELETE /api/v1/posts/{postId}/scrap — 스크랩 취소 (멱등, 항상 200) */
export async function unscrapPost(postId: number): Promise<PostScrapResponse> {
  const { data } = await client.delete<PostScrapResponse>(`/posts/${postId}/scrap`)
  return data
}

/** GET /api/v1/posts/{postId}/comments — 댓글 목록 (Slice, 답댓글 포함 트리) */
export async function getComments(
  postId: number,
  page = 0,
  size = POST_PAGE_SIZE,
): Promise<SliceResponse<PostComment>> {
  const { data } = await client.get<SliceResponse<PostComment>>(`/posts/${postId}/comments`, {
    params: { page, size },
  })
  return data
}

/** POST /api/v1/posts/{postId}/comments — 댓글/답댓글 작성 */
export async function createComment(
  postId: number,
  body: PostCommentRequest,
): Promise<PostCommentResponse> {
  const { data } = await client.post<PostCommentResponse>(`/posts/${postId}/comments`, body)
  return data
}

/** PUT /api/v1/posts/{postId}/comments/{commentId} — 댓글 수정 */
export async function updateComment(
  postId: number,
  commentId: number,
  content: string,
): Promise<PostCommentResponse> {
  const { data } = await client.put<PostCommentResponse>(
    `/posts/${postId}/comments/${commentId}`,
    { content },
  )
  return data
}

/** DELETE /api/v1/posts/{postId}/comments/{commentId} — 댓글 삭제 → 204 */
export async function deleteComment(postId: number, commentId: number): Promise<void> {
  await client.delete(`/posts/${postId}/comments/${commentId}`)
}

/** POST /api/v1/reports — 사용자 신고 등록 → 201 (본문 없음). 중복 신고 시 409("이미 신고한 대상입니다") */
export async function createReport(body: ReportRequest): Promise<void> {
  await client.post('/reports', body)
}

/** 내 활동 카운트 (GET /members/me/stats 응답) */
export type MyPageStats = {
  postCount: number
  scrapCount: number
}

/** GET /api/v1/members/me/stats — 내 작성글·스크랩 개수 (토큰 주인 기준, 파라미터 없음) */
export async function getMyStats(): Promise<MyPageStats> {
  const { data } = await client.get<MyPageStats>('/members/me/stats')
  return data
}

/** GET /api/v1/members/me/posts — 내 작성글 목록 */
export async function getMyPosts(page = 0, size = POST_PAGE_SIZE): Promise<SliceResponse<PostSummary>> {
  const { data } = await client.get<SliceResponse<PostSummary>>('/members/me/posts', {
    params: { page, size },
  })
  return data
}

/** GET /api/v1/members/me/scraps — 내 스크랩 목록 (마이페이지) */
export async function getMyScraps(page = 0, size = POST_PAGE_SIZE): Promise<SliceResponse<PostSummary>> {
  const { data } = await client.get<SliceResponse<PostSummary>>('/members/me/scraps', {
    params: { page, size },
  })
  return data
}

// ═══════════════════════════════════════════════════════════════════════════
//  Query 훅 (조회)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Slice 무한 스크롤 공통 옵션.
 * 백엔드 SliceResponse.page 는 1부터(내부 number+1)이므로,
 * 다음 요청의 0-base page 파라미터는 "지금까지 받은 페이지 수" = allPages.length 로 계산한다.
 */
function nextSliceParam<T>(lastPage: SliceResponse<T>, allPages: SliceResponse<T>[]) {
  return lastPage.hasNext ? allPages.length : undefined
}

/** 게시글 목록 (무한 스크롤). category 미지정 = 전체 탭. 목록 조회는 공개(비로그인 열람 가능). */
export function usePosts(size = POST_PAGE_SIZE, category?: PostCategory) {
  return useInfiniteQuery({
    queryKey: communityKeys.list(size, category),
    queryFn: ({ pageParam }) => getPosts(pageParam, size, category),
    initialPageParam: 0,
    getNextPageParam: nextSliceParam,
  })
}

/** 인기글 목록 (무한 스크롤). 공개(비로그인 열람 가능). */
export function usePopularPosts(size = POST_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: communityKeys.popular(size),
    queryFn: ({ pageParam }) => getPopularPosts(pageParam, size),
    initialPageParam: 0,
    getNextPageParam: nextSliceParam,
  })
}

/** 게시글 상세 */
export function usePost(postId: number) {
  const viewerId = useViewerId()
  const authReady = useAuthReady()
  return useQuery({
    queryKey: communityKeys.detail(postId, viewerId),
    queryFn: () => getPost(postId),
    enabled: authReady && Number.isFinite(postId) && postId > 0,
  })
}

/** 댓글 목록 (무한 스크롤) */
export function usePostComments(postId: number, size = POST_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: communityKeys.comments(postId),
    queryFn: ({ pageParam }) => getComments(postId, pageParam, size),
    initialPageParam: 0,
    getNextPageParam: nextSliceParam,
    enabled: Number.isFinite(postId) && postId > 0,
  })
}

/** 내 스크랩 목록 (무한 스크롤, 마이페이지) */
export function useMyScraps(size = POST_PAGE_SIZE) {
  const viewerId = useViewerId()
  const authReady = useAuthReady()
  return useInfiniteQuery({
    queryKey: communityKeys.myScraps(size, viewerId),
    queryFn: ({ pageParam }) => getMyScraps(pageParam, size),
    initialPageParam: 0,
    getNextPageParam: nextSliceParam,
    // 인증 필요 엔드포인트 — 복원 전이거나 비로그인이면 쏘지 않는다(401·/login 이동 방지)
    enabled: authReady && viewerId !== 'guest',
  })
}

/** 내 작성글 목록 (무한 스크롤) */
export function useMyPosts(size = POST_PAGE_SIZE) {
  const viewerId = useViewerId()
  const authReady = useAuthReady()
  return useInfiniteQuery({
    queryKey: communityKeys.myPosts(size, viewerId),
    queryFn: ({ pageParam }) => getMyPosts(pageParam, size),
    initialPageParam: 0,
    getNextPageParam: nextSliceParam,
    // 인증 필요 엔드포인트 — 복원 전이거나 비로그인이면 쏘지 않는다(401·/login 이동 방지)
    enabled: authReady && viewerId !== 'guest',
  })
}

/**
 * 내 활동 카운트 (프로필 카드).
 * 비로그인이면 아예 호출하지 않는다 — JWT 필수라 401만 나기 때문.
 */
export function useMyStats() {
  const viewerId = useViewerId()
  const authReady = useAuthReady()
  return useQuery({
    queryKey: communityKeys.myStats(viewerId),
    queryFn: getMyStats,
    enabled: authReady && viewerId !== 'guest',
  })
}

// ═══════════════════════════════════════════════════════════════════════════
//  Mutation 훅 (변경)
// ═══════════════════════════════════════════════════════════════════════════

/** 게시글 작성. 성공 시 목록/인기 무효화. */
export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: PostRequest) => createPost(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.lists() })
      queryClient.invalidateQueries({ queryKey: [...communityKeys.all, 'popular'] })
      queryClient.invalidateQueries({ queryKey: [...communityKeys.all, 'myStats'] })
    },
  })
}

/** 게시글 수정. 성공 시 상세 + 목록 무효화. */
export function useUpdatePost(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: PostRequest) => updatePost(postId, body),
    onSuccess: () => {
      // 본문 수정은 계정과 무관 → 해당 글의 모든 viewer 캐시를 무효화(prefix 매칭)
      queryClient.invalidateQueries({ queryKey: communityKeys.details(postId) })
      queryClient.invalidateQueries({ queryKey: communityKeys.lists() })
      queryClient.invalidateQueries({ queryKey: [...communityKeys.all, 'popular'] })
    },
  })
}

/** 게시글 삭제. 성공 시 목록/인기 무효화 (상세 캐시는 제거). */
export function useDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (postId: number) => deletePost(postId),
    onSuccess: (_data, postId) => {
      queryClient.removeQueries({ queryKey: communityKeys.details(postId) })
      queryClient.invalidateQueries({ queryKey: communityKeys.lists() })
      queryClient.invalidateQueries({ queryKey: [...communityKeys.all, 'popular'] })
      queryClient.invalidateQueries({ queryKey: [...communityKeys.all, 'myStats'] })
    },
  })
}

/**
 * 좋아요 토글 (like=true 면 등록, false 면 취소).
 * 초기 상태는 상세 응답(liked·likeCount)으로 렌더하고, 토글 응답값으로 상세 캐시를 직접 갱신한다.
 * (invalidate 로 상세를 refetch 하면 GET /posts/{id} 가 조회수를 +1 하므로 setQueryData 사용)
 * 409(P003, 이미 좋아요)를 받으면 "이미 처리됨"으로 재동기화한다. (에러 처리 X — 화면 참고)
 */
export function useLikePostMutation(postId: number) {
  const queryClient = useQueryClient()
  const viewerId = useViewerId()
  return useMutation({
    mutationFn: (like: boolean) => (like ? likePost(postId) : unlikePost(postId)),
    onSuccess: (res) => {
      // liked 는 내 상태 → 내 스코프 캐시만 갱신한다
      queryClient.setQueryData<PostDetail>(communityKeys.detail(postId, viewerId), (old) =>
        old ? { ...old, liked: res.liked, likeCount: res.likeCount } : old,
      )
      queryClient.invalidateQueries({ queryKey: [...communityKeys.all, 'popular'] })
    },
  })
}

/** 스크랩 토글 (scrap=true 면 등록, false 면 취소). 응답값으로 상세 캐시 갱신, 409(P004) 재동기화는 화면에서 처리. */
export function useScrapPostMutation(postId: number) {
  const queryClient = useQueryClient()
  const viewerId = useViewerId()
  return useMutation({
    mutationFn: (scrap: boolean) => (scrap ? scrapPost(postId) : unscrapPost(postId)),
    onSuccess: (res) => {
      queryClient.setQueryData<PostDetail>(communityKeys.detail(postId, viewerId), (old) =>
        old ? { ...old, scrapped: res.scrapped } : old,
      )
      queryClient.invalidateQueries({ queryKey: [...communityKeys.all, 'myScraps'] })
      queryClient.invalidateQueries({ queryKey: [...communityKeys.all, 'myStats'] })
    },
  })
}

/** 사용자 신고 등록. 캐시 영향 없음 — 409(중복 신고) 처리는 화면에서. */
export function useCreateReport() {
  return useMutation({
    mutationFn: (body: ReportRequest) => createReport(body),
  })
}

/** 댓글/답댓글 작성. 성공 시 해당 글 댓글 목록 무효화. */
export function useCreateComment(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: PostCommentRequest) => createComment(postId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.comments(postId) })
    },
  })
}

/** 댓글 수정. 성공 시 해당 글 댓글 목록 무효화. */
export function useUpdateComment(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      updateComment(postId, commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.comments(postId) })
    },
  })
}

/** 댓글 삭제. 성공 시 해당 글 댓글 목록 무효화. */
export function useDeleteComment(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId: number) => deleteComment(postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.comments(postId) })
    },
  })
}
