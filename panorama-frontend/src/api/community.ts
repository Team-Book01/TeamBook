/**
 * 커뮤니티(community) 도메인 API 함수 + 쿼리 훅. (community 담당자 작업 영역)
 *
 * 아래는 골격 예시입니다. 백엔드 API 확정 후 실제 구현으로 교체하세요.
 * 패턴은 src/api/book.ts 와 src/api/README.md 를 참고하세요.
 */
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { client } from './client'
// import type { Post } from '@/types'

// ── queryKey 규칙: ['community', ...] ────────────────────────────────────────
export const communityKeys = {
  all: ['community'] as const,
  // list: (params) => [...communityKeys.all, 'list', params] as const,
  // detail: (id: number) => [...communityKeys.all, 'detail', id] as const,
}

// TODO(community 담당자): 게시글 목록/상세 조회, 작성/수정/삭제 구현
//
// export async function getPosts(params): Promise<...> {
//   const { data } = await client.get('/community/posts', { params })
//   return data
// }
//
// export function usePosts(params) {
//   return useQuery({ queryKey: communityKeys.list(params), queryFn: () => getPosts(params) })
// }

export {}
