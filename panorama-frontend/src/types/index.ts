/**
 * 여러 도메인에서 공통으로 쓰는 타입 정의.
 * 도메인 전용 타입(Book, Post, Report 등)은 각 pages/<domain> 폴더 안에 둔다.
 */

/** 로그인 사용자 (백엔드 UserDto.Response 기준) */
export interface User {
  id: number
  /** 로그인 아이디 (LOCAL 계정만 존재, 소셜 계정은 null) */
  loginId: string | null
  nickname: string
  email: string
  role: 'USER' | 'ADMIN'
  /** 로그인 수단 */
  provider: 'LOCAL' | 'GOOGLE' | 'NAVER' | 'KAKAO'
  /** 이메일 인증 여부 (비밀번호 변경 가능 조건 등에 사용) */
  emailVerified: boolean
  avatarInitial?: string
  avatarColor?: string
}

/** 백엔드 공통 에러 응답(global/exception/ErrorResponse) 형태 */
export interface ErrorResponse {
  code?: string
  message?: string
  errors?: { field: string; reason: string }[]
}
