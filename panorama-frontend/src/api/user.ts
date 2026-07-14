/**
 * 마이페이지/유저(user) 도메인 API 함수 + 쿼리 훅. (user 담당자 작업 영역)
 *
 * 아래는 골격 예시입니다. 백엔드 API 확정 후 실제 구현으로 교체하세요.
 * 패턴은 src/api/book.ts 와 src/api/README.md 를 참고하세요.
 */
// import { useQuery } from '@tanstack/react-query'
// import { client } from './client'
// import type { MyProfile } from '@/types'

// ── queryKey 규칙: ['user', ...] ─────────────────────────────────────────────
export const userKeys = {
  all: ['user'] as const,
  // me: () => [...userKeys.all, 'me'] as const,
  // bookmarks: (params) => [...userKeys.all, 'bookmarks', params] as const,
}

// TODO(user 담당자): 내 프로필/내 북마크/내 리뷰 조회, 프로필 수정 구현
//
// export async function getMyProfile(): Promise<MyProfile> {
//   const { data } = await client.get<MyProfile>('/users/me')
//   return data
// }
//
// export function useMyProfile() {
//   return useQuery({ queryKey: userKeys.me(), queryFn: getMyProfile })
// }

export {}
