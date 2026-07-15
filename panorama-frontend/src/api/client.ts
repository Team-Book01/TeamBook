import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'
import type { ErrorResponse } from '@/types'

// 인증 흐름 제어용 커스텀 요청 옵션 (axios config 확장)
declare module 'axios' {
  export interface AxiosRequestConfig {
    /** 401 이어도 /login 리다이렉트·자동 재발급을 건너뛴다. (reissue 요청 자신에 사용) */
    skipAuthRedirect?: boolean
    /** 401 재발급 후 원 요청을 딱 한 번만 재시도하기 위한 내부 플래그. */
    _retry?: boolean
  }
}

/**
 * 백엔드(Spring Boot) 호출용 공통 axios 인스턴스. (팀 공통 파일 — 수정 시 팀 공유 필수)
 *
 * - baseURL 은 .env 의 VITE_API_BASE_URL 을 사용한다. (백엔드는 모두 /api/v1 로 매핑)
 *   · 쿠키 인증(refresh) 사용: 'http://localhost:8080/api/v1' 로 직접 호출한다(withCredentials + 백엔드 CORS).
 *     소셜 로그인 refresh 쿠키가 백엔드 도메인(8080)에 심기므로, reissue 가 그 쿠키를 받으려면 직접 호출이어야 한다.
 *   · vite proxy('/api/v1')는 same-origin 이라 편하지만, 소셜 로그인 refresh 쿠키(8080)를 못 실어 reissue 가 안 된다.
 * - withCredentials: refresh HttpOnly 쿠키를 주고받기 위해 필수. (백엔드 CORS allowCredentials(true) 와 짝)
 */
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// ── 요청 인터셉터: 인증 토큰 주입 ────────────────────────────────────────────
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 동시에 여러 요청이 401 을 맞아도 재발급은 한 번만 수행한다. (중복 reissue 방지)
let refreshing: Promise<string> | null = null

/** 로그인 화면으로 유도. 이미 인증 화면이면 리다이렉트 루프를 막기 위해 넘어간다. */
function redirectToLogin() {
  const path = window.location.pathname
  if (path !== '/login' && path !== '/signup') {
    const redirect = encodeURIComponent(path + window.location.search)
    window.location.href = `/login?redirect=${redirect}`
  }
}

// ── 응답 인터셉터: 401 → refresh 쿠키로 재발급 후 원 요청 1회 재시도 ──────────
client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ErrorResponse>) => {
    const status = error.response?.status
    const config = error.config as InternalAxiosRequestConfig | undefined

    // access 만료 추정(401) → refresh 쿠키로 새 access 발급 → 원 요청 재시도.
    // reissue 요청 자신(skipAuthRedirect)이나 이미 재시도한 요청(_retry)은 제외.
    if (status === 401 && config && !config._retry && !config.skipAuthRedirect) {
      config._retry = true
      try {
        refreshing =
          refreshing ??
          client
            .post<{ accessToken: string }>('/auth/reissue', null, { skipAuthRedirect: true })
            .then((r) => r.data.accessToken)
        const newToken = await refreshing
        refreshing = null

        useAuthStore.getState().setToken(newToken)
        config.headers.Authorization = `Bearer ${newToken}`
        return client(config) // 원 요청 재시도
      } catch {
        // 재발급 실패(refresh 없음/만료) → 로그아웃 + 로그인 유도
        refreshing = null
        useAuthStore.getState().logout()
        redirectToLogin()
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

/**
 * axios 에러에서 백엔드 공통 에러 응답({ code, message })을 안전하게 꺼낸다.
 * 컴포넌트에서 사용자에게 보여줄 메시지를 만들 때 사용.
 *
 * 예) const message = getErrorMessage(error, '검색에 실패했습니다.')
 */
export function getErrorMessage(error: unknown, fallback = '요청 처리 중 오류가 발생했습니다.'): string {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback
  }
  if (error instanceof Error) return error.message
  return fallback
}

/** axios 에러의 백엔드 에러 코드(ErrorResponse.code)를 꺼낸다. 없으면 undefined. */
export function getErrorCode(error: unknown): string | undefined {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    return error.response?.data?.code
  }
  return undefined
}

/** axios 에러의 HTTP 상태코드를 꺼낸다. 없으면 undefined. */
export function getErrorStatus(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) return error.response?.status
  return undefined
}
