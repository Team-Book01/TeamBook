/** 커뮤니티 화면 공용 포맷 유틸. */
import DOMPurify from 'dompurify'
import { toApiImageUrl } from '@/api/community'

/**
 * 게시글 본문(에디터 산출 HTML) 렌더용 sanitize.
 * - DOMPurify 로 스크립트/이벤트 핸들러 등 위험 요소 제거 (다른 사용자가 쓴 HTML → 신뢰 경계)
 * - 업로드 이미지 src("/images/uuid.png", 8080 오리진 기준)를 API 오리진 절대 URL 로 보정
 */
export function sanitizePostHtml(html: string): string {
  const clean = DOMPurify.sanitize(html)
  const doc = new DOMParser().parseFromString(clean, 'text/html')
  doc.body.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src')
    if (src && src.startsWith('/')) img.setAttribute('src', toApiImageUrl(src))
  })
  return doc.body.innerHTML
}

/** "2026-07-17T12:08:00" → "2026.07.17 12:08" */
export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** createdAt 기반 상대 시간. 7일 이상이면 날짜로 표기. */
export function formatRelativeTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const diffMs = Date.now() - d.getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}일 전`
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

/**
 * HTML 본문에서 태그를 걷어낸 순수 텍스트 미리보기.
 * 목록의 contentPreview 는 서버가 HTML 원문을 100자 컷한 값이라 태그 조각이 섞일 수 있다.
 */
export function stripHtml(html: string): string {
  // DOMParser 는 비활성(inert) 문서를 만들어 스크립트/이미지 로딩이 일어나지 않는다. (innerHTML 파싱보다 안전)
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent ?? '').trim()
}
