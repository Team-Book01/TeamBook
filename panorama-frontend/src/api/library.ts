/**
 * 도서관(지도) 도메인 API. 공개 조회이므로 인증 불필요(백엔드 화이트리스트).
 */
import { useQuery } from '@tanstack/react-query'
import { client } from './client'
import type { LibraryResponse } from '@/types/library'

export const libraryKeys = {
  all: ['libraries'] as const,
}

// 지도 마커용 전체 도서관 목록(좌표 포함).
export async function getLibraries(): Promise<LibraryResponse[]> {
  const { data } = await client.get<LibraryResponse[]>('/libraries')
  return data
}

export function useLibraries() {
  return useQuery({
    queryKey: libraryKeys.all,
    queryFn: getLibraries,
    staleTime: 5 * 60 * 1000, // 도서관 목록은 자주 안 바뀜 → 5분 캐시
  })
}
