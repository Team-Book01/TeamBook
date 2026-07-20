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
 *
 * ⚠️ userId 만으로는 부족하다.
 * user 는 persist 로 localStorage 에서 즉시 복원되지만 token 은 (XSS 방지를 위해)
 * 저장하지 않으므로 부팅 시 reissue 를 기다려야 한다. 즉 새로고침 직후에는
 * "userId 는 이미 있는데 token 은 없는" 구간이 존재하고, 이 구간에 나간 요청은
 * 비로그인 응답(isBookmarked=false)을 캐시에 남긴다. 그 뒤 토큰이 들어와도
 * userId 는 그대로라 무효화가 일어나지 않아 하트가 빈 채로 굳는다.
 * → 실제로 인증된 요청을 보낼 수 있게 된 시점(token 유무)까지 함께 본다.
 */
export function useAuthQuerySync() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id ?? null)
  const hasToken = useAuthStore((s) => !!s.token)

  // 사용자 + "인증 요청 가능 여부" 를 하나의 신원 키로 본다.
  // 토큰이 재발급으로 교체만 되는 경우엔 hasToken 이 계속 true 라 무효화되지 않는다.
  const authKey = `${userId ?? 'anon'}:${hasToken}`
  const prevAuthKey = useRef(authKey)

  useEffect(() => {
    if (prevAuthKey.current === authKey) return
    prevAuthKey.current = authKey
    // 사용자별로 응답이 달라지는 쿼리 (isBookmarked / isMine / 마이페이지)
    void queryClient.invalidateQueries({ queryKey: ['books'] })
  }, [authKey, queryClient])
}
