import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'
import type { ErrorResponse } from '@/types'

/**
 * 백엔드(Spring Boot) 호출용 공통 axios 인스턴스. (팀 공통 파일 — 수정 시 팀 공유 필수)
 *
 * - baseURL 은 .env 의 VITE_API_BASE_URL 을 사용한다.
 *   · 개발: '/api'  → vite.config.ts 의 proxy 가 http://localhost:8080 으로 전달(CORS 회피)
 *   · 직접 호출/프로덕션: 실제 도메인
 * - 도메인별 API 함수는 각 api/<domain>.ts 에서 이 client 를 import 해서 쓴다.
 *   예) import { client } from '@/api/client'
 */
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── 요청 인터셉터: 인증 토큰 주입 ────────────────────────────────────────────
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── 응답 인터셉터: 공통 에러 처리 (특히 401) ─────────────────────────────────
client.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ErrorResponse>) => {
    const status = error.response?.status

    // 401(인증 필요/만료) → 로그아웃 처리 후 로그인 페이지로 유도.
    // 이미 인증 화면(/login, /signup)에 있으면 리다이렉트 루프를 막기 위해 넘어간다.
    if (status === 401) {
      useAuthStore.getState().logout()
      const path = window.location.pathname
      if (path !== '/login' && path !== '/signup') {
        // redirect 파라미터로 로그인 후 돌아올 위치를 남긴다.
        const redirect = encodeURIComponent(path + window.location.search)
        window.location.href = `/login?redirect=${redirect}`
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
