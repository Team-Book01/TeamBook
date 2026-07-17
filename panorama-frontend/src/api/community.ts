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
export const communityKeys = {
  all: ['community'] as const,
  lists: () => [...communityKeys.all, 'list'] as const,
  list: (size: number) => [...communityKeys.lists(), { size }] as const,
  popular: (size: number) => [...communityKeys.all, 'popular', { size }] as const,
  detail: (postId: number) => [...communityKeys.all, 'detail', postId] as const,
  comments: (postId: number) => [...communityKeys.all, 'comments', postId] as const,
  myScraps: (size: number) => [...communityKeys.all, 'myScraps', { size }] as const,
}

// ═══════════════════════════════════════════════════════════════════════════
//  API 함수 (얇게)
// ═══════════════════════════════════════════════════════════════════════════

/** GET /api/v1/posts — 전체 게시글 목록 (Slice, page 는 0부터) */
export async function getPosts(page = 0, size = POST_PAGE_SIZE): Promise<SliceResponse<PostSummary>> {
  const { data } = await client.get<SliceResponse<PostSummary>>('/posts', {
    params: { page, size },
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

/** 전체 게시글 목록 (무한 스크롤) */
export function usePosts(size = POST_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: communityKeys.list(size),
    queryFn: ({ pageParam }) => getPosts(pageParam, size),
    initialPageParam: 0,
    getNextPageParam: nextSliceParam,
  })
}

/** 인기글 목록 (무한 스크롤) */
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
  return useQuery({
    queryKey: communityKeys.detail(postId),
    queryFn: () => getPost(postId),
    enabled: Number.isFinite(postId) && postId > 0,
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
  return useInfiniteQuery({
    queryKey: communityKeys.myScraps(size),
    queryFn: ({ pageParam }) => getMyScraps(pageParam, size),
    initialPageParam: 0,
    getNextPageParam: nextSliceParam,
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
    },
  })
}

/** 게시글 수정. 성공 시 상세 + 목록 무효화. */
export function useUpdatePost(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: PostRequest) => updatePost(postId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(postId) })
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
      queryClient.removeQueries({ queryKey: communityKeys.detail(postId) })
      queryClient.invalidateQueries({ queryKey: communityKeys.lists() })
      queryClient.invalidateQueries({ queryKey: [...communityKeys.all, 'popular'] })
    },
  })
}

/**
 * 좋아요 토글 (like=true 면 등록, false 면 취소).
 * 초기 상태 조회 API 가 없어 화면은 낙관적 토글로 운용:
 * 409(P003, 이미 좋아요)를 받으면 "이미 처리됨"으로 재동기화한다. (에러 처리 X — 화면 참고)
 */
export function useLikePostMutation(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (like: boolean) => (like ? likePost(postId) : unlikePost(postId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...communityKeys.all, 'popular'] })
    },
  })
}

/** 스크랩 토글 (scrap=true 면 등록, false 면 취소). 409(P004) 재동기화는 화면에서 처리. */
export function useScrapPostMutation(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (scrap: boolean) => (scrap ? scrapPost(postId) : unscrapPost(postId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...communityKeys.all, 'myScraps'] })
    },
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
