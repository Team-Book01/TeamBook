import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'

/**
 * 로그인 사용자가 바뀌면 "사용자별로 응답이 달라지는" 쿼리를 다시 불러온다.
 *
 * 왜 필요한가:
 * 도서 검색/상세는 permitAll 이라 비로그인으로도 200 이 내려온다. 다만 그때는
 * isBookmarked 가 항상 false 다. 앱 시작 직후에는 refresh 쿠키로 세션을 복원하는
 * (useAuthBootstrap) 동안 아직 토큰이 없어서, 그 사이에 발사된 검색/상세 요청은
 * "비로그인 응답" 을 받아 캐시에 남는다. → 북마크한 책인데 하트가 하얗게 보인다.
 * 요청이 실패한 게 아니라 200 이므로 react-query 도 자동으로 다시 부르지 않는다.
 *
 * 그래서 로그인 사용자가 확정되는 순간(비로그인 → 로그인, 계정 전환, 로그아웃)에
 * 해당 쿼리들을 무효화해 올바른 사용자 기준으로 다시 받아온다.
 *
 * 토큰만 갱신되는 경우(15분마다 reissue)에는 사용자가 그대로이므로 무효화하지 않는다.
 * (도서 검색은 매 조회마다 네이버 API 를 타므로 불필요한 재조회를 피한다)
 */
export function useAuthQuerySync() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id ?? null)
  const prevUserId = useRef<number | null>(userId)

  useEffect(() => {
    if (prevUserId.current === userId) return
    prevUserId.current = userId
    // 사용자별로 응답이 달라지는 쿼리 (isBookmarked / isMine / 마이페이지)
    void queryClient.invalidateQueries({ queryKey: ['books'] })
  }, [userId, queryClient])
}
