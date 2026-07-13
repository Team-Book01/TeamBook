/**
 * 인증(auth) 도메인 API 함수 + 쿼리 훅. (auth 담당자 작업 영역)
 *
 * 아래는 골격 예시입니다. 백엔드 API 확정 후 실제 구현으로 교체하세요.
 * 로그인 성공 시에는 useAuthStore.getState().login(user, accessToken) 으로 전역 상태를 세팅합니다.
 * 패턴은 src/api/book.ts 와 src/api/README.md 를 참고하세요.
 */
// import { useMutation } from '@tanstack/react-query'
// import { client } from './client'
// import { useAuthStore } from '@/store/authStore'
// import type { LoginRequest, LoginResponse, SignupRequest } from '@/types'

// ── queryKey 규칙: ['auth', ...] ─────────────────────────────────────────────
export const authKeys = {
  all: ['auth'] as const,
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

export {}
