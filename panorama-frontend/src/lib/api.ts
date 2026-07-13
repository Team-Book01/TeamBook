import axios from 'axios'

/**
 * 백엔드(Spring Boot) 호출용 공통 axios 인스턴스.
 *
 * - baseURL 은 .env 의 VITE_API_BASE_URL 을 사용한다.
 *   · 개발: '/api'  → vite.config.ts 의 proxy 가 http://localhost:8080 으로 전달(CORS 회피)
 *   · 직접 호출/프로덕션: 'http://localhost:8080' 또는 실제 도메인
 * - 실제 API 연동은 각 도메인 페이지에서 이 인스턴스를 import 해서 사용한다.
 *   예) import { api } from '@/lib/api'
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// 요청 인터셉터: 로그인 연동 후 zustand/스토리지의 토큰을 여기서 주입하면 된다.
api.interceptors.request.use((config) => {
  // const token = useAuthStore.getState().token
  // if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 응답 인터셉터: 백엔드 공통 에러 응답(ErrorResponse) 처리 지점.
api.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(error),
)
