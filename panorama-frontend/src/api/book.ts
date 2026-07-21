/**
 * 도서(book) 도메인 API 함수 + TanStack Query 훅. (도서 담당자 작업 영역)
 *
 * 구조 원칙
 * - API 함수는 "얇게": axios 호출 + 반환만. 비즈니스 로직/상태 없음.
 * - 조회는 useQuery/useInfiniteQuery, 변경(생성·수정·삭제·토글)은 useMutation.
 * - mutation 성공 시 관련 query 를 invalidate 해서 화면을 자동 갱신한다.
 */
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { InfiniteData, QueryClient } from '@tanstack/react-query'
import { client } from './client'
import type {
  BookDetail,
  BookItem,
  BookmarkRequest,
  BookmarkResponse,
  BookSearchParams,
  BookSearchResponse,
  CreateReviewRequest,
  LibraryListResponse,
  LibraryParams,
  MyBookmarkResponse,
  MyReviewResponse,
  Review,
  ReviewListResponse,
  UpdateReviewRequest,
} from '@/types/book'
import { useAuthStore } from '@/store/authStore'

// ── 인증 확정 대기 ───────────────────────────────────────────────────────────
/**
 * 세션 복원(useAuthBootstrap)이 끝났는지 여부. 응답이 사용자에 따라 달라지는
 * 쿼리는 이 값이 true 가 되기 전에는 요청하지 않는다.
 *
 * 왜 필요한가:
 * /books/** 는 permitAll 이라 토큰 없이도 200 이 내려온다. 다만 그때는
 * isBookmarked 가 항상 false 다. 새로고침 직후에는 access 토큰이 메모리에만
 * 있어(XSS 방지) reissue 로 다시 받아야 하는데, 그걸 기다리지 않고 요청하면
 * "비로그인 응답" 이 캐시에 남아 북마크 하트가 하얗게 보인다.
 *
 * 나중에 invalidate 로 고치는 방식은 경쟁 조건이 있다. 토큰이 도착한 순간
 * 그 요청이 아직 in-flight 면 invalidateQueries 는 isInvalidated 만 켜고
 * 재요청을 걸지 않아, 뒤늦게 도착한 비로그인 응답이 그대로 남는다.
 * → 아예 인증이 확정된 뒤에 한 번만 요청해서 경쟁 자체를 없앤다.
 *
 * 비로그인 사용자도 reissue 가 401 로 빠르게 끝나므로 지연은 한 번의 왕복뿐이다.
 */
function useAuthReady(): boolean {
  return useAuthStore((s) => s.authReady)
}

// ── isbn 유효성 ──────────────────────────────────────────────────────────────
/**
 * 상세 조회가 가능한 도서인지 판별한다.
 *
 * 네이버 검색 결과에는 isbn 이 없는 도서(전집·세트 상품 등)가 섞여 있다.
 * 이런 도서는 상세/북마크/리뷰/도서관 API 의 키가 없으므로 진입 자체를 막는다.
 */
export function hasIsbn(isbn?: string | null): boolean {
  return typeof isbn === 'string' && isbn.trim().length > 0
}

/** isbn 이 없는 도서에 공통으로 노출하는 안내 문구 */
export const NO_ISBN_MESSAGE = '상세 정보를 제공하지 않는 도서입니다'

// ── 지역 코드 ───────────────────────────────────────────────────────────────
// 소장 도서관 조회는 지역을 시도(regionCode) + 시군구(dtlRegion) 두 단계로 받는다.
// 코드 테이블은 regionCodes.ts 로 분리했다. (기존 SEOUL_DISTRICTS 는 두 단계가
// 섞여 있어 5자리 구 코드를 regionCode 로 보내고 있었으므로 제거)
export {
  REGIONS,
  DEFAULT_REGION_CODE,
  findRegion,
  getDistricts,
} from './regionCodes'
export type { RegionCode, DistrictCode } from './regionCodes'

/** 검색/무한스크롤 기본 페이지 크기 */
export const BOOK_SEARCH_DISPLAY = 10

/** 소장 도서관 목록 페이지당 건수 (백엔드 pageSize 기본값과 동일) */
export const LIBRARY_PAGE_SIZE = 10

// ── queryKey 규칙 ────────────────────────────────────────────────────────────
// ['books', <구분>, ...식별자] 형태로 통일. (자세한 규칙은 src/api/README.md 참고)
export const bookKeys = {
  all: ['books'] as const,
  search: (params: BookSearchParams) => [...bookKeys.all, 'search', params] as const,
  popular: () => [...bookKeys.all, 'popular'] as const,
  detail: (isbn: string) => [...bookKeys.all, 'detail', isbn] as const,
  reviews: (isbn: string, page: number, size: number) =>
    [...bookKeys.all, 'reviews', isbn, { page, size }] as const,
  libraries: (isbn: string, params: LibraryParams) =>
    [...bookKeys.all, 'libraries', isbn, params] as const,
  myBookmarks: () => [...bookKeys.all, 'my', 'bookmarks'] as const,
  myBookmarkCount: () => [...bookKeys.all, 'my', 'bookmarkCount'] as const,
  myReviews: () => [...bookKeys.all, 'my', 'reviews'] as const,
  myReviewCount: () => [...bookKeys.all, 'my', 'reviewCount'] as const,
  // 도서 상세용 "내 리뷰 단건". 'my' 프리픽스 아래에 둬서 작성/수정/삭제 mutation 의
  // invalidate([...all,'my']) 에 함께 걸리게 한다.
  myReview: (isbn: string) => [...bookKeys.all, 'my', 'review', isbn] as const,
}

// ═══════════════════════════════════════════════════════════════════════════
//  API 함수 (얇게)
// ═══════════════════════════════════════════════════════════════════════════

/** GET /api/v1/books/search — 도서 검색 */
export async function searchBooks(params: BookSearchParams): Promise<BookSearchResponse> {
  const { data } = await client.get<BookSearchResponse>('/books/search', { params })
  return data
}

/**
 * POST /api/v1/books/ocr — 이미지에서 ISBN 추출 (로그인 필요)
 *
 * 이미지에 책이 없는 건 정상 상황이라 실패를 예외로 올리지 않는다.
 * 404(OCR001)·권한·네트워크 등 모든 에러는 삼키고 null 을 돌려주며, 호출부는 침묵한다.
 */
export async function extractIsbnFromImage(image: Blob | File): Promise<string | null> {
  const form = new FormData()
  form.append('image', image)
  try {
    const { data } = await client.post<{ isbn: string }>('/books/ocr', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.isbn?.trim() ? data.isbn.trim() : null
  } catch {
    return null
  }
}

/** GET /api/v1/books/{isbn} — 도서 상세 */
export async function getBook(isbn: string): Promise<BookDetail> {
  const { data } = await client.get<BookDetail>(`/books/${isbn}`)
  return data
}

/**
 * GET /api/v1/books/popularBooks — 인기 대출 도서 (도서관정보나루 기준, 랭킹순 최대 10건).
 * 응답은 검색과 같은 BookSearchResponse 이며, items 에 ranking/loanCount 가 채워져 온다.
 */
export async function getPopularBooks(): Promise<BookItem[]> {
  const { data } = await client.get<BookSearchResponse>('/books/popularBooks')
  return data.items
}

/** POST /api/v1/bookmark/toggle — 북마크 토글 (로그인 필요) */
export async function toggleBookmark(body: BookmarkRequest): Promise<BookmarkResponse> {
  const { data } = await client.post<BookmarkResponse>('/bookmark/toggle', body)
  return data
}

/** GET /api/v1/bookmark/myBookmarks — 내 북마크 목록 (로그인 필요) */
export async function getMyBookmarks(): Promise<MyBookmarkResponse> {
  const { data } = await client.get<MyBookmarkResponse>('/bookmark/myBookmarks')
  return data
}

/** GET /api/v1/bookmark/myBookmarkCount — 내 북마크 개수 (로그인 필요) */
export async function getMyBookmarkCount(): Promise<number> {
  const { data } = await client.get<number>('/bookmark/myBookmarkCount')
  return data
}

/** GET /api/v1/reviews/{isbn} — 리뷰 목록 */
export async function getReviews(
  isbn: string,
  page = 1,
  size = 10,
): Promise<ReviewListResponse> {
  const { data } = await client.get<ReviewListResponse>(`/reviews/${isbn}`, {
    params: { page, size },
  })
  return data
}

/** POST /api/v1/reviews/{isbn} — 리뷰 작성 (로그인 필요) */
export async function createReview(
  isbn: string,
  body: CreateReviewRequest,
): Promise<Review> {
  const { data } = await client.post<Review>(`/reviews/${isbn}`, body)
  return data
}

/** PUT /api/v1/reviews/{reviewId} — 리뷰 수정 (로그인 필요) */
export async function updateReview(
  reviewId: number,
  body: UpdateReviewRequest,
): Promise<Review> {
  const { data } = await client.put<Review>(`/reviews/${reviewId}`, body)
  return data
}

/** DELETE /api/v1/reviews/{reviewId} — 리뷰 삭제 (로그인 필요). 성공 시 204 No Content. */
export async function deleteReview(reviewId: number): Promise<void> {
  await client.delete<void>(`/reviews/${reviewId}`)
}

/**
 * GET /api/v1/reviews/myReview?isbn= — 도서 상세용 내 리뷰 단건 (로그인 필요).
 *
 * 응답은 리뷰 목록과 같은 ReviewItem(=Review) 형태다.
 * 내 리뷰가 없거나(REVIEW_NOT_FOUND) DB 미등록 도서(BOOK_NOT_FOUND)면 백엔드가 404 를 준다 —
 * "내 리뷰 없음" 은 정상 상황이라 예외로 올리지 않고 null 로 흡수한다(작성 폼을 보여주면 된다).
 */
export async function getMyReview(isbn: string): Promise<Review | null> {
  try {
    const { data } = await client.get<Review>('/reviews/myReview', {
      params: { isbn },
    })
    return data ?? null
  } catch {
    return null
  }
}

/** GET /api/v1/reviews/myReviewList — 내 리뷰 목록 (로그인 필요) */
export async function getMyReviews(): Promise<MyReviewResponse> {
  const { data } = await client.get<MyReviewResponse>('/reviews/myReviewList')
  return data
}

/** GET /api/v1/reviews/myReviewCount — 내 리뷰 개수 (로그인 필요) */
export async function getMyReviewCount(): Promise<number> {
  const { data } = await client.get<number>('/reviews/myReviewCount')
  return data
}

/**
 * GET /api/v1/library/{isbn}?regionCode=&dtlRegion=&pageNo=&pageSize= — 소장 도서관 + 대출 가능 여부
 *
 * - dtlRegion 은 선택값이라 비어 있으면 아예 쿼리에서 뺀다.
 *   (빈 문자열로 보내면 원본 API 가 dtl_region= 를 유효한 값으로 오해할 수 있다)
 * - pageNo/pageSize 는 백엔드에도 기본값(1/10)이 있지만, 현재 페이지 상태를 명시적으로
 *   전달하기 위해 항상 함께 보낸다.
 */
export async function getLibraries(
  isbn: string,
  params: LibraryParams,
): Promise<LibraryListResponse> {
  const { regionCode, dtlRegion, pageNo, pageSize = LIBRARY_PAGE_SIZE } = params
  const { data } = await client.get<LibraryListResponse>(`/library/${isbn}`, {
    params: {
      regionCode,
      ...(dtlRegion ? { dtlRegion } : {}),
      pageNo,
      pageSize,
    },
  })
  return data
}

// ═══════════════════════════════════════════════════════════════════════════
//  캐시 유틸 (검색 캐시 → 상세 initialData 재사용)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 검색 무한스크롤 캐시(useInfiniteQuery)를 전부 뒤져 isbn 이 일치하는 항목을 찾는다.
 *
 * - 검색 쿼리는 keyword/sort 조합마다 별도 캐시라, bookKeys.search(=['books','search',...])
 *   프리픽스로 매칭되는 모든 쿼리를 순회한다.
 * - 무한스크롤이라 데이터 구조는 { pages: [{ items: [...] }, ...] } 형태.
 * - 반환에 dataUpdatedAt 을 함께 실어, 상세 훅이 initialDataUpdatedAt 으로 쓰게 한다.
 *   (그래야 캐시가 오래됐으면 상세 진입 시 백그라운드 refetch 가 일어난다)
 *
 * 검색 → 클릭 진입: 캐시 히트 → 즉시 렌더(로딩 없음).
 * 새로고침/URL 직접 접근/공유 링크: 캐시 미스 → undefined → 평소대로 API 호출.
 */
export function findBookInSearchCache(
  queryClient: QueryClient,
  isbn: string,
): { data: BookItem; updatedAt: number } | undefined {
  if (!isbn) return undefined

  const queries = queryClient
    .getQueryCache()
    .findAll({ queryKey: [...bookKeys.all, 'search'] })

  for (const query of queries) {
    const data = query.state.data as InfiniteData<BookSearchResponse> | undefined
    if (!data?.pages) continue
    for (const page of data.pages) {
      const hit = page.items.find((item) => item.isbn === isbn)
      if (hit) return { data: hit, updatedAt: query.state.dataUpdatedAt }
    }
  }
  return undefined
}

// ═══════════════════════════════════════════════════════════════════════════
//  Query 훅 (조회)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 도서 검색 (무한 스크롤).
 * start 를 display 만큼 증가시켜 다음 페이지를 불러온다(start=1, 11, 21 …).
 *
 * 사용 예)
 *   const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useBookSearch({ keyword })
 *   const items = data?.pages.flatMap((p) => p.items) ?? []
 */
export function useBookSearch(params: BookSearchParams) {
  const display = params.display ?? BOOK_SEARCH_DISPLAY
  const authReady = useAuthReady()
  return useInfiniteQuery({
    queryKey: bookKeys.search(params),
    queryFn: ({ pageParam }) => searchBooks({ ...params, start: pageParam, display }),
    initialPageParam: params.start ?? 1,
    getNextPageParam: (lastPage) => {
      const nextStart = lastPage.start + lastPage.display
      return nextStart <= lastPage.total ? nextStart : undefined
    },
    // keyword 가 있을 때만 실행 (빈 검색어로 요청 방지)
    // + 세션 복원 전에는 대기 → isBookmarked 가 비로그인 값으로 굳는 것 방지
    enabled: params.keyword.trim().length > 0 && authReady,
  })
}

/**
 * 도서 상세.
 * isbn 이 없으면(빈 문자열) 요청하지 않는다 → 상세 진입 비활성화 처리와 짝을 맞춘다.
 *
 * initialData: 검색 목록에서 클릭해 들어오면 이미 받아둔 항목이 캐시에 있으므로
 * 그 데이터로 즉시 화면을 렌더한다(로딩 없음). 검색 응답에도 description 이 포함돼
 * 상세와 필드가 동일하므로 그대로 재사용할 수 있다.
 * - 캐시 히트: initialData + initialDataUpdatedAt(원본 수신 시각) → 오래됐으면 백그라운드 refetch.
 * - 캐시 미스: undefined → 로딩 표시 후 API 호출.
 */
export function useBook(isbn: string) {
  const queryClient = useQueryClient()
  const cached = findBookInSearchCache(queryClient, isbn)
  const authReady = useAuthReady()
  return useQuery({
    queryKey: bookKeys.detail(isbn),
    queryFn: () => getBook(isbn),
    // 세션 복원 전에는 대기 (useAuthReady 주석 참고)
    enabled: hasIsbn(isbn) && authReady,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.updatedAt,
  })
}

/** 인기 대출 도서 (홈 캐러셀 · 도서검색 사이드바 공용). 공개 API 라 로그인 불필요. */
export function usePopularBooks() {
  return useQuery({
    queryKey: bookKeys.popular(),
    queryFn: getPopularBooks,
    // 인기 대출 집계는 자주 바뀌지 않으므로 오래 신선하게 둔다.
    staleTime: 60 * 60_000,
  })
}

/** 리뷰 목록 (page/size 페이지네이션) */
export function useBookReviews(isbn: string, page = 1, size = 10) {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: bookKeys.reviews(isbn, page, size),
    queryFn: () => getReviews(isbn, page, size),
    // isbn 이 빈 값/누락(null)이어도 렌더 중 터지지 않도록 방어적으로 체크
    // + isMine 이 비로그인 값으로 굳지 않도록 세션 복원을 기다린다
    enabled: hasIsbn(isbn) && authReady,
  })
}

/**
 * 도서 상세용 내 리뷰 단건.
 * - 로그인 사용자가 이 책에 남긴 리뷰가 있으면 그 리뷰를, 없으면 null 을 준다.
 * - 비로그인 사용자는 요청하지 않는다(항상 "내 리뷰 없음" 으로 취급).
 * - 작성/수정/삭제 mutation 이 [...all,'my'] 를 invalidate 하므로 자동으로 갱신된다.
 */
export function useMyReview(isbn: string) {
  const authReady = useAuthReady()
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: bookKeys.myReview(isbn),
    queryFn: () => getMyReview(isbn),
    enabled: hasIsbn(isbn) && authReady && !!user,
  })
}

/**
 * 소장 도서관 목록 (regionCode 필수, 서버 페이징).
 * - `enabled` 로 조회 시점을 호출부가 제어한다(지역 선택 후 "찾기" 를 눌렀을 때만 요청).
 * - 페이지 이동 시 queryKey 의 pageNo 가 바뀌어 새로 조회한다. placeholderData 로
 *   이전 페이지를 유지해, 페이지 전환 중 목록이 빈 화면으로 깜빡이지 않게 한다.
 */
export function useBookLibraries(
  isbn: string,
  params: LibraryParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: bookKeys.libraries(isbn, params),
    queryFn: () => getLibraries(isbn, params),
    enabled:
      (options?.enabled ?? true) && hasIsbn(isbn) && params.regionCode.length > 0,
    placeholderData: (prev) => prev,
  })
}

// ── 마이페이지 (로그인 필요) ─────────────────────────────────────────────────

/** 내 북마크 목록 */
export function useMyBookmarks(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: bookKeys.myBookmarks(),
    queryFn: getMyBookmarks,
    enabled: options?.enabled ?? true,
  })
}

/** 내 북마크 개수 */
export function useMyBookmarkCount(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: bookKeys.myBookmarkCount(),
    queryFn: getMyBookmarkCount,
    enabled: options?.enabled ?? true,
  })
}

/** 내 리뷰 목록 */
export function useMyReviews(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: bookKeys.myReviews(),
    queryFn: getMyReviews,
    enabled: options?.enabled ?? true,
  })
}

/** 내 리뷰 개수 */
export function useMyReviewCount(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: bookKeys.myReviewCount(),
    queryFn: getMyReviewCount,
    enabled: options?.enabled ?? true,
  })
}

// ═══════════════════════════════════════════════════════════════════════════
//  Mutation 훅 (변경)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 북마크 토글.
 *
 * 검색 목록/상세 캐시를 refetch 없이 직접 갱신한다.
 * (상세·검색 모두 매 조회 시 네이버 API 를 호출하므로, invalidate 로 재조회를 걸면
 *  느리고 rate-limit 에 취약하다. 응답이 해당 도서의 확정값 isBookmarked/bookmarkCount 를
 *  주므로 그 값으로 캐시를 직접 덮어쓰는 편이 즉각적이고 안정적이다.)
 *
 * - onMutate: 클릭 즉시 상세 + 모든 검색 캐시에서 해당 isbn 을 낙관적으로 토글 → UI 즉시 반응.
 * - onError: 스냅샷으로 롤백.
 * - onSuccess: 서버 확정값으로 상세 + 검색 캐시를 덮어쓴다.
 */
export function useBookmarkMutation() {
  const queryClient = useQueryClient()
  const searchFilter = { queryKey: [...bookKeys.all, 'search'] as const }

  /** 상세 + 모든 검색 캐시에서 isbn 이 일치하는 항목에 updater 를 적용한다. */
  const writeBook = (isbn: string, updater: (item: BookItem) => BookItem) => {
    queryClient.setQueryData<BookDetail>(bookKeys.detail(isbn), (old) =>
      old ? (updater(old) as BookDetail) : old,
    )
    queryClient.setQueriesData<InfiniteData<BookSearchResponse>>(searchFilter, (old) =>
      old
        ? {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((it) => (it.isbn === isbn ? updater(it) : it)),
            })),
          }
        : old,
    )
  }

  return useMutation({
    mutationFn: (body: BookmarkRequest) => toggleBookmark(body),
    onMutate: async (variables) => {
      const detailKey = bookKeys.detail(variables.isbn)
      // 진행 중인 refetch 를 취소해 낙관적 값이 덮이지 않게 한다.
      await Promise.all([
        queryClient.cancelQueries({ queryKey: detailKey }),
        queryClient.cancelQueries(searchFilter),
      ])
      // 롤백용 스냅샷
      const prevDetail = queryClient.getQueryData<BookDetail>(detailKey)
      const prevSearches = queryClient.getQueriesData<InfiniteData<BookSearchResponse>>(searchFilter)
      // 낙관적 토글 (하트 뒤집고 카운트 ±1)
      writeBook(variables.isbn, (it) => ({
        ...it,
        isBookmarked: !it.isBookmarked,
        bookmarkCount: it.bookmarkCount + (it.isBookmarked ? -1 : 1),
      }))
      return { prevDetail, prevSearches }
    },
    onError: (_err, variables, context) => {
      if (context?.prevDetail) {
        queryClient.setQueryData(bookKeys.detail(variables.isbn), context.prevDetail)
      }
      context?.prevSearches?.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
    onSuccess: (data, variables) => {
      // 서버 확정값으로 상세 + 검색 캐시 동기화 (하트 상태 + 정확한 카운트)
      writeBook(variables.isbn, (it) => ({
        ...it,
        isBookmarked: data.isBookmarked,
        bookmarkCount: data.bookmarkCount,
      }))
      // 마이페이지 북마크 목록/개수는 서버 재조회 (네이버 API 를 타지 않아 부담이 적다)
      queryClient.invalidateQueries({ queryKey: [...bookKeys.all, 'my'] })
    },
  })
}

/** 리뷰 작성. 성공 시 해당 도서의 리뷰 목록 + 상세(리뷰수/평점) 갱신. */
export function useCreateReview(isbn: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateReviewRequest) => createReview(isbn, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...bookKeys.all, 'reviews', isbn] })
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(isbn) })
      queryClient.invalidateQueries({ queryKey: [...bookKeys.all, 'my'] })
    },
  })
}

/** 리뷰 수정. 성공 시 해당 도서의 리뷰 목록 + 상세 갱신. */
export function useUpdateReview(isbn: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, body }: { reviewId: number; body: UpdateReviewRequest }) =>
      updateReview(reviewId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...bookKeys.all, 'reviews', isbn] })
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(isbn) })
      queryClient.invalidateQueries({ queryKey: [...bookKeys.all, 'my'] })
    },
  })
}

/** 리뷰 삭제. 성공 시 해당 도서의 리뷰 목록 + 상세 갱신. */
export function useDeleteReview(isbn: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reviewId: number) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...bookKeys.all, 'reviews', isbn] })
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(isbn) })
      queryClient.invalidateQueries({ queryKey: [...bookKeys.all, 'my'] })
    },
  })
}
