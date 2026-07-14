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
  DeleteReviewResponse,
  LibraryListResponse,
  LibraryParams,
  Review,
  ReviewListResponse,
  UpdateReviewRequest,
} from '@/types/book'

// ── 상수: 서울시 구 지역코드 ─────────────────────────────────────────────────
// 소장 도서관 조회(getLibraries)의 region 파라미터에 사용.
export const SEOUL_DISTRICTS = [
  { name: '종로구', code: '11010' },
  { name: '중구', code: '11020' },
  { name: '용산구', code: '11030' },
  { name: '성동구', code: '11040' },
  { name: '광진구', code: '11050' },
  { name: '동대문구', code: '11060' },
  { name: '중랑구', code: '11070' },
  { name: '성북구', code: '11080' },
  { name: '강북구', code: '11090' },
  { name: '도봉구', code: '11100' },
  { name: '노원구', code: '11110' },
  { name: '은평구', code: '11120' },
  { name: '서대문구', code: '11130' },
  { name: '마포구', code: '11140' },
  { name: '양천구', code: '11150' },
  { name: '강서구', code: '11160' },
  { name: '구로구', code: '11170' },
  { name: '금천구', code: '11180' },
  { name: '영등포구', code: '11190' },
  { name: '동작구', code: '11200' },
  { name: '관악구', code: '11210' },
  { name: '서초구', code: '11220' },
  { name: '강남구', code: '11230' },
  { name: '송파구', code: '11240' },
  { name: '강동구', code: '11250' },
] as const

/** 검색/무한스크롤 기본 페이지 크기 */
export const BOOK_SEARCH_DISPLAY = 10

// ── queryKey 규칙 ────────────────────────────────────────────────────────────
// ['books', <구분>, ...식별자] 형태로 통일. (자세한 규칙은 src/api/README.md 참고)
export const bookKeys = {
  all: ['books'] as const,
  search: (params: BookSearchParams) => [...bookKeys.all, 'search', params] as const,
  detail: (isbn: string) => [...bookKeys.all, 'detail', isbn] as const,
  reviews: (isbn: string, page: number, size: number) =>
    [...bookKeys.all, 'reviews', isbn, { page, size }] as const,
  libraries: (isbn: string, params: LibraryParams) =>
    [...bookKeys.all, 'libraries', isbn, params] as const,
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

/** POST /api/v1/books/bookmark — 북마크 토글 (로그인 필요) */
export async function toggleBookmark(body: BookmarkRequest): Promise<BookmarkResponse> {
  const { data } = await client.post<BookmarkResponse>('/books/bookmark', body)
  return data
}

/** GET /api/v1/books/{isbn}/reviews — 리뷰 목록 */
export async function getReviews(
  isbn: string,
  page = 1,
  size = 10,
): Promise<ReviewListResponse> {
  const { data } = await client.get<ReviewListResponse>(`/books/${isbn}/reviews`, {
    params: { page, size },
  })
  return data
}

/** POST /api/v1/books/{isbn}/reviews — 리뷰 작성 (로그인 필요) */
export async function createReview(
  isbn: string,
  body: CreateReviewRequest,
): Promise<Review> {
  const { data } = await client.post<Review>(`/books/${isbn}/reviews`, body)
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

/** DELETE /api/v1/reviews/{reviewId} — 리뷰 삭제 (로그인 필요) */
export async function deleteReview(reviewId: number): Promise<DeleteReviewResponse> {
  const { data } = await client.delete<DeleteReviewResponse>(`/reviews/${reviewId}`)
  return data
}

/** GET /api/v1/books/{isbn}/libraries — 소장 도서관 + 대출 가능 여부 */
export async function getLibraries(
  isbn: string,
  params: LibraryParams,
): Promise<LibraryListResponse> {
  const { data } = await client.get<LibraryListResponse>(`/books/${isbn}/libraries`, {
    params,
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
  return useInfiniteQuery({
    queryKey: bookKeys.search(params),
    queryFn: ({ pageParam }) => searchBooks({ ...params, start: pageParam, display }),
    initialPageParam: params.start ?? 1,
    getNextPageParam: (lastPage) => {
      const nextStart = lastPage.start + lastPage.display
      return nextStart <= lastPage.total ? nextStart : undefined
    },
    // keyword 가 있을 때만 실행 (빈 검색어로 요청 방지)
    enabled: params.keyword.trim().length > 0,
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
  return useQuery({
    queryKey: bookKeys.detail(isbn),
    queryFn: () => getBook(isbn),
    enabled: isbn.length > 0,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.updatedAt,
  })
}

/** 리뷰 목록 (page/size 페이지네이션) */
export function useBookReviews(isbn: string, page = 1, size = 10) {
  return useQuery({
    queryKey: bookKeys.reviews(isbn, page, size),
    queryFn: () => getReviews(isbn, page, size),
    enabled: isbn.length > 0,
  })
}

/** 소장 도서관 목록 (region 필수) */
export function useBookLibraries(isbn: string, params: LibraryParams) {
  return useQuery({
    queryKey: bookKeys.libraries(isbn, params),
    queryFn: () => getLibraries(isbn, params),
    enabled: isbn.length > 0 && params.region.length > 0,
  })
}

// ═══════════════════════════════════════════════════════════════════════════
//  Mutation 훅 (변경)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 북마크 토글.
 *
 * - 낙관적 업데이트: 클릭 즉시 상세 캐시의 하트 상태·카운트를 뒤집어 UI 가 바로 반응한다.
 *   실패하면 이전 값으로 롤백한다.
 * - 성공 시 서버가 준 확정값(isBookmarked/bookmarkCount)으로 상세 캐시를 덮어쓴다.
 * - 마지막에 검색 목록(여러 keyword 조합) + 상세를 invalidate 해서 서버 기준으로 재동기화한다.
 */
export function useBookmarkMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: BookmarkRequest) => toggleBookmark(body),
    onMutate: async (variables) => {
      const detailKey = bookKeys.detail(variables.isbn)
      // 진행 중인 상세 refetch 를 취소해 낙관적 값이 덮이지 않게 한다.
      await queryClient.cancelQueries({ queryKey: detailKey })
      const prevDetail = queryClient.getQueryData<BookDetail>(detailKey)
      if (prevDetail) {
        queryClient.setQueryData<BookDetail>(detailKey, {
          ...prevDetail,
          isBookmarked: !prevDetail.isBookmarked,
          bookmarkCount: prevDetail.bookmarkCount + (prevDetail.isBookmarked ? -1 : 1),
        })
      }
      return { prevDetail }
    },
    onError: (_err, variables, context) => {
      if (context?.prevDetail) {
        queryClient.setQueryData(bookKeys.detail(variables.isbn), context.prevDetail)
      }
    },
    onSuccess: (data, variables) => {
      // 서버 확정값으로 상세 캐시 동기화 (하트 상태 + 정확한 카운트)
      queryClient.setQueryData<BookDetail>(bookKeys.detail(variables.isbn), (old) =>
        old
          ? { ...old, isBookmarked: data.isBookmarked, bookmarkCount: data.bookmarkCount }
          : old,
      )
    },
    onSettled: (_data, _err, variables) => {
      // 검색 결과 전체 + 해당 도서 상세를 서버 기준으로 재동기화
      queryClient.invalidateQueries({ queryKey: [...bookKeys.all, 'search'] })
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(variables.isbn) })
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
    },
  })
}
