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

// 동시에 여러 요청이 401 을 맞아도 재발급은 한 번만 수행한다. (중복 reissue 방지)
let refreshing: Promise<string> | null = null

/** refresh 쿠키로 새 access 토큰을 받는다. 동시 호출은 하나로 합친다. */
function refreshAccessToken(): Promise<string> {
  refreshing =
    refreshing ??
    client
      .post<{ accessToken: string }>('/auth/reissue', null, { skipAuthRedirect: true })
      .then((r) => r.data.accessToken)
      .finally(() => {
        refreshing = null
      })
  return refreshing
}

/**
 * JWT 의 exp 를 보고 이미 만료됐는지 판단한다. (형식이 이상하면 만료로 간주하지 않음)
 *
 * 서버 시계와의 오차를 감안해 5초 여유를 둔다.
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1]
    if (!payload) return false
    const json = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    ) as { exp?: number }
    if (typeof json.exp !== 'number') return false
    return json.exp * 1000 <= Date.now() + 5_000
  } catch {
    return false
  }
}

// ── 요청 인터셉터: 인증 토큰 주입 ────────────────────────────────────────────
//
// ⚠️ 만료된 access 토큰을 그대로 보내면 안 된다.
//    /books/**, /reviews/** GET 처럼 permitAll 인 엔드포인트는 토큰이 만료돼도
//    401 이 아니라 "비로그인(200)" 으로 처리된다. 그러면 isBookmarked 가 항상 false 로
//    내려와 북마크 하트가 조용히 풀린 것처럼 보이고, 401 이 아니라서 아래 응답
//    인터셉터의 자동 재발급도 동작하지 않는다.
//    → 보내기 전에 만료를 확인하고, 만료됐으면 먼저 재발급받아 새 토큰으로 보낸다.
client.interceptors.request.use(async (config) => {
  let token = useAuthStore.getState().token

  if (token && isTokenExpired(token) && !config.skipAuthRedirect) {
    try {
      token = await refreshAccessToken()
      useAuthStore.getState().setToken(token)
    } catch {
      // 재발급 실패(refresh 없음/만료) → 비로그인으로 진행. 보호된 요청은 401 로 처리된다.
      useAuthStore.getState().logout()
      token = null
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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
        const newToken = await refreshAccessToken()
        useAuthStore.getState().setToken(newToken)
        config.headers.Authorization = `Bearer ${newToken}`
        return client(config) // 원 요청 재시도
      } catch {
        // 재발급 실패(refresh 없음/만료) → 로그아웃 + 로그인 유도
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
