import { useQuery } from '@tanstack/react-query'
import { client } from './client'

/** GET /api/v1/stats/community 응답 (백엔드 CommunityStatsResponse) */
export interface CommunityStats {
  /** 오늘 방문자 수(오늘 로그인 성공한 고유 회원) */
  todayVisitors: number
  /** 전체 게시글 수(삭제 제외) */
  totalPosts: number
}

/** GET /api/v1/stats/community — 홈 커뮤니티 현황(공개, 로그인 불필요) */
export async function getCommunityStats(): Promise<CommunityStats> {
  const { data } = await client.get<CommunityStats>('/stats/community')
  return data
}

export function useCommunityStats() {
  return useQuery({ queryKey: ['stats', 'community'], queryFn: getCommunityStats })
}
