/**
 * 관리자(admin) 도메인 API 함수 + 쿼리 훅. (admin 담당자 작업 영역)
 *
 * 아래는 골격 예시입니다. 백엔드 API 확정 후 실제 구현으로 교체하세요.
 * 패턴은 src/api/book.ts 와 src/api/README.md 를 참고하세요.
 */
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { client } from './client'
// import type { AdminUserRow } from '@/types'

// ── queryKey 규칙: ['admin', ...] ────────────────────────────────────────────
export const adminKeys = {
  all: ['admin'] as const,
  // users: (params) => [...adminKeys.all, 'users', params] as const,
  // reports: (params) => [...adminKeys.all, 'reports', params] as const,
}

// TODO(admin 담당자): 사용자/콘텐츠/신고/문의/공지 관리 API 구현
//
// export async function getAdminUsers(params): Promise<...> {
//   const { data } = await client.get('/admin/users', { params })
//   return data
// }
//
// export function useAdminUsers(params) {
//   return useQuery({ queryKey: adminKeys.users(params), queryFn: () => getAdminUsers(params) })
// }

export {}
