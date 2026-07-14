/**
 * 도서(book) 도메인 타입. 백엔드 domain/book DTO 기준 수기 동기화.
 * @see src/api/book.ts (이 타입들을 사용하는 API 함수 + 쿼리 훅)
 */

// ── 검색 ────────────────────────────────────────────────────────────────────

/** 검색 대상 필드 */
//export type BookSearchType = 'title' | 'author'
/** 정렬 기준 (sim: 정확도순, date: 최신순) */
export type BookSort = 'sim' | 'date'

/** GET /api/v1/books/search 요청 쿼리 */
export interface BookSearchParams {
  keyword: string
  //searchType?: BookSearchType // 기본 title
  sort?: BookSort // 기본 sim
  start?: number // 기본 1 (무한 스크롤: 1, 11, 21 …)
  display?: number // 기본 10
}

/** 검색 결과 1건 (= 목록/상세 공통 필드) */
export interface BookItem {
  isbn: string // 없을 수 있음(빈 문자열) → 상세 진입 비활성화 처리
  title: string
  author: string
  publisher: string
  pubdate: string // yyyymmdd 형식 문자열
  image: string
  link: string
  /** 네이버 판매가(숫자 문자열, 없으면 빈 문자열) */
  discount?: string
  /** 책 소개 본문 (검색 응답에도 포함 → 상세 initialData 로 그대로 재사용) */
  description: string
  /** 아래 3개는 DB에 없는 책이면 0 */
  avgRating: number
  reviewCount: number
  bookmarkCount: number
  isBookmarked: boolean
}

/** GET /api/v1/books/search 응답 */
export interface BookSearchResponse {
  total: number
  start: number
  display: number
  items: BookItem[]
}

// ── 상세 ────────────────────────────────────────────────────────────────────

/** GET /api/v1/books/{isbn} 응답 = 검색 item + description */
export interface BookDetail extends BookItem {
  description: string
}

// ── 북마크 ──────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/books/bookmark 요청 body.
 * 책이 DB에 없으면 이 정보로 생성(find-or-create).
 * ⚠️ userId 는 서버가 인증 토큰에서 추출한다 — body 에 절대 넣지 말 것.
 */
export interface BookmarkRequest {
  isbn: string
  title?: string
  author?: string
  publisher?: string
  pubdate?: string
  image?: string
  link?: string
  description?: string
}

/** POST /api/v1/books/bookmark 응답 */
export interface BookmarkResponse {
  isBookmarked: boolean
  bookmarkCount: number
}

// ── 리뷰 ────────────────────────────────────────────────────────────────────

export interface Review {
  reviewId: number
  nickname: string
  rating: number // 0.5 ~ 5.0 (0.5 단위)
  content: string
  createdAt: string // ISO-8601 (예: 2026-07-01T12:00:00)
}

/** GET /api/v1/books/{isbn}/reviews 응답 */
export interface ReviewListResponse {
  total: number
  page: number
  size: number
  reviews: Review[]
}

/** POST /api/v1/books/{isbn}/reviews 요청 body */
export interface CreateReviewRequest {
  rating: number // 필수, 0.5~5.0, 0.5 단위
  content?: string // 선택, 최대 500자
}

/** PUT /api/v1/reviews/{reviewId} 요청 body */
export interface UpdateReviewRequest {
  rating: number
  content?: string
}

/** DELETE /api/v1/reviews/{reviewId} 응답 */
export interface DeleteReviewResponse {
  deleted: boolean
}

// ── 소장 도서관 ──────────────────────────────────────────────────────────────

/** GET /api/v1/books/{isbn}/libraries 요청 쿼리 */
export interface LibraryParams {
  region: string // 서울 구 코드 (필수) — SEOUL_DISTRICTS 참고
  page?: number // 기본 1
}

export interface Library {
  libCode: string
  name: string
  address: string
  phone: string
  latitude: number
  longitude: number
  hasBook: boolean
  /** 대출 가능 여부. 조회 실패 시 null('확인 불가') */
  loanAvailable: boolean | null
}

/** GET /api/v1/books/{isbn}/libraries 응답 */
export interface LibraryListResponse {
  total: number
  page: number
  libraries: Library[]
}
