/**
 * 공지 enum(백엔드 영문값) ↔ 화면 표기(한글) 매핑 + 배지 스타일.
 * 백엔드: category GENERAL/EVENT/UPDATE/MAINTENANCE, status ACTIVE/HIDDEN/DELETED
 */
import type { NoticeCategory, NoticeStatus } from '@/types/admin'

export const NOTICE_CATEGORY_LABEL: Record<NoticeCategory, string> = {
  GENERAL: '일반',
  EVENT: '이벤트',
  UPDATE: '업데이트',
  MAINTENANCE: '점검',
}

export const NOTICE_CATEGORY_OPTIONS: { value: NoticeCategory; label: string }[] = [
  { value: 'GENERAL', label: '일반' },
  { value: 'EVENT', label: '이벤트' },
  { value: 'UPDATE', label: '업데이트' },
  { value: 'MAINTENANCE', label: '점검' },
]

// 카테고리 배지 — 구분용 팔레트라 의미색으로 유지
export const NOTICE_CATEGORY_BADGE: Record<NoticeCategory, string> = {
  GENERAL: 'bg-gray-100 text-gray-500',
  EVENT: 'bg-violet-100 text-violet-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  MAINTENANCE: 'bg-orange-100 text-orange-700',
}

export const NOTICE_STATUS_META: Record<NoticeStatus, { dot: string; text: string; label: string }> = {
  ACTIVE: { dot: 'bg-green-500', text: 'text-green-700', label: '게시중' },
  HIDDEN: { dot: 'bg-gray-400', text: 'text-gray-500', label: '숨김' },
  DELETED: { dot: 'bg-red-500', text: 'text-red-600', label: '삭제' },
}

/** 날짜 표기: ISO date-time → YYYY-MM-DD */
export function formatDate(iso?: string | null): string {
  if (!iso) return '-'
  return iso.slice(0, 10)
}
