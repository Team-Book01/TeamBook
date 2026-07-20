import { useMutation } from '@tanstack/react-query'
import { client } from './client'

/** 관리자 문의 관리 화면(CATEGORY_LABEL)과 같은 8개 분류. */
export const INQUIRY_CATEGORIES: { value: string; label: string }[] = [
  { value: 'ACCOUNT', label: '계정·로그인' },
  { value: 'BOOK', label: '도서·도서관' },
  { value: 'CONTENT', label: '게시판·콘텐츠' },
  { value: 'SERVICE', label: '서비스' },
  { value: 'REPORT', label: '신고·제재' },
  { value: 'PAYMENT', label: '결제' },
  { value: 'BUG', label: '버그·오류' },
  { value: 'ETC', label: '기타' },
]

export interface InquirySubmitRequest {
  category: string
  title: string
  content: string
}

/**
 * POST /api/v1/inquiries — 문의 등록 (본문 + 첨부 이미지, 201 본문 없음).
 *
 * inquiry_images.inquiry_id 는 NOT NULL 이라(게시글·공지처럼 이미지를 먼저 올려두는 방식이
 * 불가능) 본문과 파일을 한 멀티파트 요청으로 함께 보낸다. "request" 파트는 JSON Blob 으로
 * 실어야 서버가 InquirySubmitRequestDto 로 역직렬화한다 — 그냥 문자열 필드로 append 하면
 * Content-Type 이 text/plain 이 되어 바인딩되지 않는다.
 */
export async function submitInquiry(request: InquirySubmitRequest, images: File[]): Promise<void> {
  const form = new FormData()
  form.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }))
  images.forEach(file => form.append('images', file))
  await client.post('/inquiries', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function useSubmitInquiry() {
  return useMutation({
    mutationFn: ({ request, images }: { request: InquirySubmitRequest; images: File[] }) =>
      submitInquiry(request, images),
  })
}
