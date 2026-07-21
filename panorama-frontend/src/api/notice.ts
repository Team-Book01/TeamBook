import { useQuery } from '@tanstack/react-query'
import { client } from './client'
import type { PageResponse } from '@/types/common'
import type { NoticeCategory, NoticeDetail, NoticeSummary } from '@/types/notice'

export const NOTICE_CATEGORY_LABEL: Record<NoticeCategory, string> = {
  GENERAL: '일반',
  EVENT: '이벤트',
  UPDATE: '업데이트',
  MAINTENANCE: '점검',
}

export const NOTICE_CATEGORY_BADGE: Record<NoticeCategory, string> = {
  GENERAL: 'bg-gray-100 text-gray-500',
  EVENT: 'bg-violet-100 text-violet-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  MAINTENANCE: 'bg-orange-100 text-orange-700',
}

export const NOTICE_CATEGORIES: NoticeCategory[] = ['GENERAL', 'EVENT', 'UPDATE', 'MAINTENANCE']

export interface NoticeListParams {
  category?: NoticeCategory
  page?: number
  size?: number
}

/** GET /api/v1/notices — 로그인 여부와 무관하게 호출 가능(서버가 GET 만 permitAll). */
export async function getNotices(params: NoticeListParams = {}): Promise<PageResponse<NoticeSummary>> {
  const { data } = await client.get<PageResponse<NoticeSummary>>('/notices', { params })
  return data
}

/** GET /api/v1/notices/{id} — 호출할 때마다 서버에서 조회수가 1 증가한다. */
export async function getNotice(noticeId: number): Promise<NoticeDetail> {
  const { data } = await client.get<NoticeDetail>(`/notices/${noticeId}`)
  return data
}

export function useNotices(params: NoticeListParams = {}) {
  return useQuery({ queryKey: ['notices', params], queryFn: () => getNotices(params) })
}

export function useNotice(noticeId: number | null) {
  return useQuery({
    queryKey: ['notices', 'detail', noticeId],
    queryFn: () => getNotice(noticeId as number),
    enabled: noticeId != null,
    // 상세 재조회마다 조회수가 오르므로, 화면 재방문·refocus 로 GC 없이 자동 재요청되지 않게 한다.
    refetchOnWindowFocus: false,
  })
}
