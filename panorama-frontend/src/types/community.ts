/**
 * 커뮤니티(community) 도메인 타입. 백엔드 domain/post DTO 기준 수기 동기화.
 * @see src/api/community.ts
 *
 * 동기화 기준 (panorama-backend/src/main/java/com/teambook/panorama/domain/post/)
 * - enums/PostCategory.java
 * - dto/PostSummaryResponseDto.java / PostDetailResponseDto.java / PostRequestDto.java / PostResponseDto.java
 * - dto/PostCommentListResponseDto.java / PostCommentReplyResponseDto.java /
 *   PostCommentRequestDto.java / PostCommentUpdateRequestDto.java / PostCommentResponseDto.java
 * - dto/PostImageResponseDto.java / PostLikeResponseDto.java / PostScrapResponseDto.java
 * - global/response/SliceResponse.java
 */

/** 게시글 카테고리 (백엔드 PostCategory enum). 한국어 라벨 매핑은 api/community.ts 의 POST_CATEGORY_LABEL 참고. */
export type PostCategory = 'RECOMMEND' | 'REVIEW' | 'FREE'

/**
 * Slice 페이징 공통 응답 (백엔드 global/response/SliceResponse).
 * page 는 1부터 시작(slice.getNumber() + 1), hasNext 로 다음 페이지 유무 판단.
 */
export interface SliceResponse<T> {
  content: T[]
  page: number
  size: number
  hasNext: boolean
}

/** 목록/인기/내 스크랩 공통 아이템 (백엔드 PostSummaryResponseDto). */
export interface PostSummary {
  postId: number
  /** 연결 도서가 없으면 null */
  bookId: number | null
  nickname: string
  category: PostCategory
  title: string
  /** 서버에서 100자 컷(97자 + "...") 처리된 본문 미리보기 (HTML 원문 기준) */
  contentPreview: string
  viewCount: number
  /** ISO LocalDateTime 문자열 (예: 2026-07-17T12:34:56) */
  createdAt: string
  bookTitle: string | null
  author: string | null
}

/** 게시글 상세 (백엔드 PostDetailResponseDto). content 는 에디터 산출 HTML. */
export interface PostDetail {
  postId: number
  bookId: number | null
  /** 작성자 userId — 내 글 여부(수정/삭제 노출) 판단용 */
  userId: number
  nickname: string
  category: PostCategory
  title: string
  content: string
  viewCount: number
  createdAt: string
}

/** 게시글 작성/수정 요청 body (백엔드 PostRequestDto). imageKeys 는 수정(PUT) 시 서버가 무시. */
export interface PostRequest {
  category: PostCategory
  title: string
  content: string
  /** 이미지 업로드(POST /posts/images) 응답의 imageKey 수집 배열. 이미지 없으면 생략 */
  imageKeys?: string[]
}

/** 작성(201)/수정(200) 응답 (백엔드 PostResponseDto). */
export interface PostResponse {
  postId: number
}

/** 이미지 업로드 응답 아이템 (백엔드 PostImageResponseDto). imageUrl 은 8080 오리진 기준 경로(/images/uuid.png). */
export interface PostImage {
  imageKey: string
  imageUrl: string
}

/** 좋아요/취소 응답 (백엔드 PostLikeResponseDto). */
export interface PostLikeResponse {
  liked: boolean
  likeCount: number
}

/** 스크랩/취소 응답 (백엔드 PostScrapResponseDto). */
export interface PostScrapResponse {
  scrapped: boolean
}

/** 답댓글 (백엔드 PostCommentReplyResponseDto). */
export interface PostCommentReply {
  commentId: number
  nickname: string
  content: string
  createdAt: string
}

/** 루트 댓글 + 답댓글 목록 (백엔드 PostCommentListResponseDto). */
export interface PostComment {
  commentId: number
  nickname: string
  content: string
  createdAt: string
  replies: PostCommentReply[]
}

/** 댓글 작성 요청 (백엔드 PostCommentRequestDto). replyToCommentId 가 있으면 답댓글. */
export interface PostCommentRequest {
  replyToCommentId?: number | null
  content: string
}

/** 댓글 작성/수정 응답 (백엔드 PostCommentResponseDto). */
export interface PostCommentResponse {
  commentId: number
  content: string
}
