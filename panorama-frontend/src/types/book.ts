/**
 * 도서(book) 도메인 타입. 백엔드 domain/book DTO 기준 수기 동기화.
 * @see src/api/book.ts (이 타입들을 사용하는 API 함수 + 쿼리 훅)
 *
 * 대응 백엔드 컨트롤러
 * - BookSearchController  GET  /api/v1/books/search
 * - BookDetailController  GET  /api/v1/books/{isbn}
 * - BookmarkController    POST /api/v1/bookmark/toggle, GET /api/v1/bookmark/myBookmarks, /myBookmarkCount
 * - ReviewController      GET/POST /api/v1/reviews/{isbn}, PUT/DELETE /api/v1/reviews/{reviewId},
 *                         GET /api/v1/reviews/myReviewList, /myReviewCount
 * - LibraryController     GET  /api/v1/library/{isbn}?regionCode=
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

/** 검색 결과 1건 (= 목록/상세 공통 필드, 백엔드 BookSearchItem) */
export interface BookItem {
  /** 네이버가 isbn 을 안 주는 도서(전집/세트 등)가 있어 빈 문자열/누락 가능 → hasIsbn() 로 판별 */
  isbn: string
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
  /** 이 책으로 작성된 커뮤니티 게시글 수 (검색/상세 공통 집계). 상세 진입 initialData 로도 재사용 */
  postCount?: number
  /** 인기 대출 도서 응답 전용(일반 검색엔 없음): 랭킹 / 대출 횟수(숫자 문자열) */
  ranking?: string
  loanCount?: string
}

/** GET /api/v1/books/search 응답 (백엔드 BookSearchResponse) */
export interface BookSearchResponse {
  total: number
  start: number
  display: number
  items: BookItem[]
}

// ── 상세 ────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/books/{isbn} 응답 (백엔드 BookDetailResponse).
 * BookSearchItem 과 필드가 같고 postCount 만 추가된다(현재 백엔드는 항상 0).
 * discount 는 상세 응답에 없으므로 optional 인 BookItem 정의를 그대로 쓴다.
 */
export interface BookDetail extends BookItem {
  /** 이 책으로 작성된 커뮤니티 게시글 수 (ACTIVE 기준, 백엔드 집계) */
  postCount?: number
}

// ── 북마크 ──────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/bookmark/toggle 요청 body (백엔드 BookmarkRequest).
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

/** POST /api/v1/bookmark/toggle 응답 (백엔드 BookmarkResponse) */
export interface BookmarkResponse {
  isBookmarked: boolean
  bookmarkCount: number
}

/** 마이페이지 북마크 1건 (백엔드 MyBookmarkItem) */
export interface MyBookmarkItem {
  isbn: string
  bookTitle: string
  author: string
  bookImage: string
  createdAt: string // ISO-8601
}

/** GET /api/v1/bookmark/myBookmarks 응답 (백엔드 MyBookmarkResponse) */
export interface MyBookmarkResponse {
  total: number
  myBookmarkItems: MyBookmarkItem[]
}

// ── 리뷰 ────────────────────────────────────────────────────────────────────

/** 리뷰 1건 (백엔드 ReviewItem) */
export interface Review {
  reviewId: number
  nickname: string
  rating: number // 0.5 ~ 5.0 (0.5 단위)
  content: string
  createdAt: string // ISO-8601 (예: 2026-07-01T12:00:00)
  /** 로그인 사용자가 작성한 리뷰인지 */
  isMine: boolean
}

/**
 * 별점 분포. key 는 별점 문자열('0.5' ~ '5.0'), value 는 해당 별점의 리뷰 수.
 * 백엔드가 0.5 단위 10개 버킷을 0 으로 초기화해 항상 채워서 내려준다.
 */
export type RatingDistribution = Record<string, number>

/** GET /api/v1/reviews/{isbn} 응답 (백엔드 ReviewResponse) */
export interface ReviewListResponse {
  total: number
  page: number
  size: number
  reviewItems: Review[]
  ratingDistribution: RatingDistribution
}

/** POST /api/v1/reviews/{isbn} 요청 body (백엔드 ReviewRequest) */
export interface CreateReviewRequest {
  rating: number // 필수, 0.5~5.0, 0.5 단위
  content?: string // 선택, 최대 500자
}

/** PUT /api/v1/reviews/{reviewId} 요청 body (백엔드 ReviewRequest — 작성과 동일) */
export type UpdateReviewRequest = CreateReviewRequest

/** 마이페이지 리뷰 1건 (백엔드 MyReviewItem) */
export interface MyReviewItem {
  reviewId: number
  isbn: string
  bookTitle: string
  bookImage: string
  rating: number
  createdAt: string // ISO-8601
  content: string
}

/** GET /api/v1/reviews/myReviewList 응답 (백엔드 MyReviewResponse) */
export interface MyReviewResponse {
  total: number
  reviewItems: MyReviewItem[]
}

// ── 소장 도서관 ──────────────────────────────────────────────────────────────

/**
 * GET /api/v1/library/{isbn} 요청 쿼리.
 * 지역은 두 단계로 나뉜다 (원본 도서관정보나루 API 의 region / dtl_region).
 * @see src/api/regionCodes.ts (시도·시군구 코드 테이블)
 */
export interface LibraryParams {
  /** 시도 코드 2자리 (필수, 예: '11' = 서울). 백엔드 @RequestParam("regionCode") */
  regionCode: string
  /** 시군구 코드 5자리 (선택, 예: '11010' = 종로구). 생략하면 시도 전체 조회 */
  dtlRegion?: string
  /**
   * 페이지 번호 (1부터). 백엔드 기본값도 1이지만, 페이지네이션 상태를 명시적으로
   * 넘기기 위해 프론트에서는 항상 보낸다.
   */
  pageNo: number
  /** 페이지당 건수 (선택, 백엔드 기본값 10) */
  pageSize?: number
}

/** 도서관 1건 (백엔드 LibraryResponseItem) */
export interface Library {
  libCode: string
  libName: string
  address: string
  /** 없을 수 있음 */
  tel?: string | null
  /** 없거나 빈 문자열이면 이름 클릭 링크 비활성화 */
  homepage?: string | null
  operatingTime?: string | null
  /** 소장 여부. 조회 실패 시 null('확인 불가') */
  hasBook: boolean | null
  /** 대출 가능 여부. 조회 실패 시 null('확인 불가') */
  loanAvailable: boolean | null
}

/** GET /api/v1/library/{isbn} 응답 (백엔드 LibraryListResponse) */
export interface LibraryListResponse {
  total: number
  libs: Library[]
}
