import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client } from './client'
import type { PageResponse } from '@/types/common'
import type {
  InquiryDetailResponse,
  InquiryResponse,
  InquirySearchRequest,
} from '@/types/admin'

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
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ request, images }: { request: InquirySubmitRequest; images: File[] }) =>
      submitInquiry(request, images),
    // 제출 후 "나의 문의" 목록/개수를 최신화한다.
    onSuccess: () => qc.invalidateQueries({ queryKey: inquiryKeys.all }),
  })
}

// ── 내 문의 조회 (문의게시판) ────────────────────────────────────────────────────
// 응답 형태(InquiryResponse / InquiryDetailResponse)는 관리자 문의 목록과 동일해서
// types/admin.ts 의 타입을 그대로 재사용한다. 다만 조회 대상은 "내가 쓴 문의" 로 한정된다.
//
// ⚠️ 백엔드 필요: 아래 두 GET 엔드포인트(로그인 사용자 본인 문의만 반환)는 아직 없다.
//    현재 문의 목록/상세 API 는 /api/v1/admin/** 아래 ADMIN 전용뿐이라 일반 사용자는 못 쓴다.
//    → 백엔드 보고 참고. (POST /api/v1/inquiries 제출은 이미 동작한다)
export const inquiryKeys = {
  all: ['inquiries'] as const,
  list: (params?: InquirySearchRequest) => [...inquiryKeys.all, 'list', params ?? {}] as const,
  detail: (id: number) => [...inquiryKeys.all, 'detail', id] as const,
}

/** GET /api/v1/inquiries — 내 문의 목록 (로그인 사용자 본인 문의) */
export async function getMyInquiries(
  params: InquirySearchRequest = {},
): Promise<PageResponse<InquiryResponse>> {
  const { data } = await client.get<PageResponse<InquiryResponse>>('/inquiries', { params })
  return data
}

/** GET /api/v1/inquiries/{id} — 내 문의 상세 (문의 + 답변 목록) */
export async function getMyInquiry(inquiryId: number): Promise<InquiryDetailResponse> {
  const { data } = await client.get<InquiryDetailResponse>(`/inquiries/${inquiryId}`)
  return data
}

export function useMyInquiries(params: InquirySearchRequest = {}) {
  return useQuery({ queryKey: inquiryKeys.list(params), queryFn: () => getMyInquiries(params) })
}

export function useMyInquiry(inquiryId: number | null) {
  return useQuery({
    queryKey: inquiryKeys.detail(inquiryId ?? 0),
    queryFn: () => getMyInquiry(inquiryId as number),
    enabled: inquiryId != null,
  })
}
