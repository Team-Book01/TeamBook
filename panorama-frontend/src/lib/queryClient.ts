import { QueryClient } from '@tanstack/react-query'
import { getErrorStatus } from '@/api/client'

/**
 * TanStack Query 전역 클라이언트 (팀 공통 설정 — 수정 시 팀 공유 필수).
 * main.tsx 의 QueryClientProvider 에 주입한다.
 *
 * 기본 정책
 * - staleTime 60초: 방금 받은 데이터는 60초 동안 "신선"으로 간주 → 불필요한 재요청 억제.
 * - gcTime 5분: 화면에서 사라진 쿼리 캐시를 5분간 보관(기본값).
 * - retry: 4xx(잘못된 요청/인증/권한/없음)는 재시도 무의미하므로 재시도 안 함.
 *          그 외(네트워크/5xx)는 1회만 재시도.
 * - refetchOnWindowFocus: 창 포커스마다 재요청하는 기본 동작은 끔(요청 노이즈 감소).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = getErrorStatus(error)
        if (status && status >= 400 && status < 500) return false
        return failureCount < 1
      },
    },
    mutations: {
      // 변경 요청은 재시도하지 않는다(중복 생성 등 부작용 방지).
      retry: 0,
    },
  },
})
