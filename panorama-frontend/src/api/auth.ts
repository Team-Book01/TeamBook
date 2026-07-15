/**
 * 인증(auth) 도메인 API 함수 + 쿼리 훅. (auth 담당자 작업 영역)
 *
 * 아래는 골격 예시입니다. 백엔드 API 확정 후 실제 구현으로 교체하세요.
 * 로그인 성공 시에는 useAuthStore.getState().login(user, accessToken) 으로 전역 상태를 세팅합니다.
 * 패턴은 src/api/book.ts 와 src/api/README.md 를 참고하세요.
 */
import { client } from './client'
import type { User } from '@/types'
// import { useMutation } from '@tanstack/react-query'
// import { useAuthStore } from '@/store/authStore'
// import type { LoginRequest, LoginResponse, SignupRequest } from '@/types'

// ── queryKey 규칙: ['auth', ...] ─────────────────────────────────────────────
export const authKeys = {
  all: ['auth'] as const,
}

/** 로그인 수단 (백엔드 Provider enum). */
type Provider = 'LOCAL' | 'GOOGLE' | 'NAVER' | 'KAKAO'

/** GET /users/me 응답 (백엔드 UserDto.Response 기준). */
interface MeResponse {
  userId: number
  nickname: string
  profileImageUrl: string | null
  provider: Provider
  role: 'USER' | 'ADMIN'
}

/** POST /auth/login 응답 (백엔드 LoginDto.Response 기준. refresh 는 HttpOnly 쿠키로 별도 발급). */
interface LoginResponse {
  accessToken: string
  provider: Provider
}

/**
 * 아이디/비밀번호 로그인 (POST /auth/login) → 내 정보 조회까지 한 번에.
 *
 * 백엔드 로그인 응답은 accessToken 만 주고 사용자 정보는 없어서,
 * 소셜 로그인과 동일하게 getMe 로 프로필을 채운 뒤 { token, user } 를 돌려준다.
 * 전역 상태(authStore) 세팅은 호출한 화면에서 한다.
 */
export async function loginWithPassword(
  loginId: string,
  password: string,
): Promise<{ token: string; user: User }> {
  const { data } = await client.post<LoginResponse>('/auth/login', { loginId, password })
  const user = await getMe(data.accessToken)
  return { token: data.accessToken, user }
}

/**
 * access 토큰 재발급 (POST /auth/reissue).
 *
 * refresh 는 HttpOnly 쿠키로 자동 전송되므로 body 가 필요 없다.
 * skipAuthRedirect: 실패(401)해도 client 인터셉터가 /login 으로 보내지 않게 한다
 * (앱 시작 시 비로그인 상태를 조용히 처리하기 위함).
 */
export async function reissue(): Promise<string> {
  const { data } = await client.post<{ accessToken: string }>('/auth/reissue', null, {
    skipAuthRedirect: true,
  })
  return data.accessToken
}

/**
 * 로그아웃 (POST /auth/logout).
 * 백엔드가 저장된 refresh 토큰을 삭제하고 refresh 쿠키를 만료시킨다.
 * 전역 상태(authStore) 정리는 호출한 화면에서 한다.
 */
export async function logout(): Promise<void> {
  await client.post('/auth/logout')
}

/** 회원가입 요청 body (백엔드 SignUpDto.Request 기준). */
export interface SignupRequest {
  loginId: string
  password: string
  nickname: string
  email: string
}

/**
 * 로컬 회원가입 (POST /users).
 * 성공 시 201(본문 없음), 중복이면 409(U002=아이디 / U003=닉네임 / U004=이메일).
 */
export async function signup(body: SignupRequest): Promise<void> {
  await client.post('/users', body)
}

/**
 * 아이디/닉네임 중복 확인 (GET /users/exists).
 * loginId 또는 nickname 중 정확히 하나만 넘긴다. exists=true 면 이미 사용 중.
 */
export async function checkExists(
  params: { loginId: string } | { nickname: string },
): Promise<boolean> {
  const { data } = await client.get<{ exists: boolean }>('/users/exists', { params })
  return data.exists
}

/**
 * 현재 로그인 사용자 조회 (GET /users/me).
 *
 * 소셜 로그인 콜백에서 URL 로 받은 access 토큰으로 프로필을 채울 때 사용한다.
 * 이 시점엔 아직 전역 스토어에 토큰이 없어 client 인터셉터가 헤더를 못 붙이므로,
 * Authorization 헤더를 명시적으로 넘긴다.
 */
export async function getMe(accessToken: string): Promise<User> {
  const { data } = await client.get<MeResponse>('/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return {
    id: data.userId,
    nickname: data.nickname,
    email: '', // /me 응답에 email 없음 — 추후 백엔드 확장 시 채운다
    role: data.role,
    avatarInitial: data.nickname.slice(0, 1),
  }
}

// TODO(auth 담당자): 로그인/회원가입 구현
//
// export async function login(body: LoginRequest): Promise<LoginResponse> {
//   const { data } = await client.post<LoginResponse>('/auth/login', body)
//   return data
// }
//
// export function useLogin() {
//   const setLogin = useAuthStore((s) => s.login)
//   return useMutation({
//     mutationFn: (body: LoginRequest) => login(body),
//     onSuccess: (res) => setLogin(res.user, res.accessToken),
//   })
// }
//
// export async function signup(body: SignupRequest): Promise<void> { ... }
