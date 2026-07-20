/**
 * 도서관(지도) 도메인 타입. 백엔드 domain/library DTO 기준 수기 동기화.
 * @see src/api/library.ts
 */

// GET /api/v1/libraries 응답 1건. (BigDecimal 위경도는 JSON number 로 내려온다)
export interface LibraryResponse {
  libId: number
  name: string
  address: string
  tel: string | null
  latitude: number
  longitude: number
  homepageUrl: string | null
  operatingHours: string | null
  closedDays: string | null
  bookCount: number | null
}
