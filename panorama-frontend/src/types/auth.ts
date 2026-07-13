/**
 * 인증(auth) 도메인 타입. 백엔드 domain/user(또는 auth) DTO 기준 수기 동기화.
 * @see src/api/auth.ts
 *
 * ⚠️ 담당자 작업 영역: 로그인/회원가입 요청·응답 타입은 백엔드 확정 후 채워주세요.
 */

/**
 * 로그인 사용자 (전역 상태 authStore 에서 사용).
 * 추후 백엔드 인증 응답에 맞춰 확장.
 */
export interface User {
  id: number
  nickname: string
  email: string
  role: 'USER' | 'ADMIN'
  avatarInitial?: string
  avatarColor?: string
}

// TODO(auth 담당자): 아래는 골격 예시. 백엔드 DTO 확정 후 실제 필드로 교체하세요.

/** POST /api/auth/login 요청 body */
export interface LoginRequest {
  email: string
  password: string
}

/** POST /api/auth/login 응답 (JWT 토큰 + 사용자) */
export interface LoginResponse {
  accessToken: string
  user: User
}

/** POST /api/auth/signup 요청 body */
export interface SignupRequest {
  email: string
  password: string
  nickname: string
}
