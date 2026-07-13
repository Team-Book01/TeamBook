/**
 * 여러 도메인에서 공통으로 쓰는 타입 정의.
 * 도메인 전용 타입(Book, Post, Report 등)은 각 pages/<domain> 폴더 안에 둔다.
 */

/** 로그인 사용자 (추후 백엔드 응답에 맞춰 확장) */
export interface User {
  id: number
  nickname: string
  email: string
  role: 'USER' | 'ADMIN'
  avatarInitial?: string
  avatarColor?: string
}

/** 백엔드 공통 에러 응답(global/exception/ErrorResponse) 형태 */
export interface ErrorResponse {
  code?: string
  message?: string
  errors?: { field: string; reason: string }[]
}
