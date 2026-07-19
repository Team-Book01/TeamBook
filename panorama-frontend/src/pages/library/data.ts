import type { LibraryResponse } from '@/types/library'

// ─── Types ───────────────────────────────────────────────────────────────────
// 화면(사이드바/지도)이 쓰는 뷰모델. 서버 응답(LibraryResponse) + 클라 파생값(거리/좌표).

export interface Library {
  id: number
  name: string
  address: string
  sido: string // 주소에서 파싱한 시/도 (예: '서울'). 지역 필터용
  phone: string
  hours: string
  closedDay: string
  homepageUrl: string | null
  type: '국립' | '공공'
  isOpen: boolean
  lat: number
  lng: number
  distance: string // 표시용: "1.2km" (기준점=내 위치 또는 서울시청)
  distanceKm: number // 정렬·반경필터용
}

export interface LatLng {
  lat: number
  lng: number
}

// 내 위치 기준 이 반경(km) 이내의 도서관만 표시한다. (전국 1600여 곳 → 주변만)
export const RADIUS_KM = 3

// 위치를 허용하지 않았을 때 쓰는 기본 기준점(서울시청).
export const SEOUL_CITY_HALL: LatLng = { lat: 37.5665, lng: 126.978 }

// 검색 모드는 반경을 벗어나 전국(1600곳)을 대상으로 한다.
// "도서관" 같은 흔한 말은 대부분이 매칭되므로, 가까운 순으로 이만큼만 지도·목록에 올린다.
// (상한에 걸리면 화면에 "N곳 중 가까운 M곳"으로 표시해 잘렸음을 숨기지 않는다)
export const SEARCH_RESULT_LIMIT = 100

// "이 지역에서 검색" 모드 상한. 클러스터러가 마커는 감당하지만 사이드바 카드는 가상화가 없어
// 수백 장을 넘기면 느려진다. 상한에 걸리면 검색 모드와 동일하게 잘렸음을 표시한다.
export const AREA_RESULT_LIMIT = 200

// ─── 지역(시/도) ──────────────────────────────────────────────────────────────
// 주소 첫 토큰이 전부 시/도라 파싱이 신뢰 가능하다.
// 그래서 지역은 자유 텍스트로 추측하지 않고 이 구조화 필터로 고르게 한다.
//
// 전남·광주 통합으로 신설된 '전남광주통합특별시' 는 여기서 다루지 않는다.
// 원본(data4library)이 신·구 명칭을 혼용하지만 백엔드 LibraryDataSanitizer 가 동기화 시점에
// 구 명칭으로 통일하므로, 프론트에는 아래 목록의 값만 도착한다.
// (혹시 통합 명칭이 그대로 오면 '기타'로 떨어져 지역 필터에 잡히지 않는다 → 백엔드 보정을 확인할 것)
export const SIDO_LIST = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
] as const

const SIDO_ALIAS: Record<string, string> = {
  서울특별시: '서울',
  부산광역시: '부산',
  대구광역시: '대구',
  인천광역시: '인천',
  광주광역시: '광주',
  대전광역시: '대전',
  울산광역시: '울산',
  세종특별자치시: '세종',
  경기도: '경기',
  강원특별자치도: '강원',
  충청북도: '충북',
  충청남도: '충남',
  전북특별자치도: '전북',
  전라남도: '전남',
  경상북도: '경북',
  경상남도: '경남',
  제주특별자치도: '제주',
}

export function parseSido(address: string): string {
  const head = address.trim().split(/\s+/)[0] ?? ''
  return SIDO_ALIAS[head] ?? '기타'
}

// ─── 검색 매칭 랭킹 ───────────────────────────────────────────────────────────
/**
 * 낮을수록 강한 매칭. 이름 매칭이 주소 매칭보다 항상 위로 온다.
 *
 * 이름에 지역명이 든 도서관이 235곳(15%)이라, 이름/주소 매칭을 구분 없이 섞으면
 * "왜 이 결과가 먼저 나오지?"가 된다. 지역은 시/도 필터로 고르고, 검색창은 이름 중심으로 둔다.
 * (주소 매칭은 "신사동" 같은 세부 주소 검색을 위해 남기되 가장 아래로 보낸다)
 *
 * @returns 0=이름 완전일치, 1=이름 시작, 2=이름 포함, 3=주소 포함, -1=매칭 없음
 */
export function matchRank(lib: Library, needle: string): number {
  if (!needle) return 0
  const name = lib.name.toLowerCase()
  if (name === needle) return 0
  if (name.startsWith(needle)) return 1
  if (name.includes(needle)) return 2
  if (lib.address.toLowerCase().includes(needle)) return 3
  return -1
}

// 지도 영역(남서/북동 모서리).
export interface Bounds {
  sw: LatLng
  ne: LatLng
}

// 좌표가 지도 영역 안에 있는지.
export function inBounds(lat: number, lng: number, b: Bounds): boolean {
  return lat >= b.sw.lat && lat <= b.ne.lat && lng >= b.sw.lng && lng <= b.ne.lng
}

// ─── 거리(하버사인) ───────────────────────────────────────────────────────────
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.sqrt(h))
}

// 운영시간 문자열에서 "HH:MM~HH:MM"(또는 -)을 찾아 현재 영업중인지 추정.
// 형식이 제각각이라 파싱 실패 시엔 열림(true)으로 둔다(지도 표시가 목적이라 보수적으로).
function guessOpen(operatingHours: string | null): boolean {
  if (!operatingHours) return true
  const m = operatingHours.match(/(\d{1,2}):(\d{2})\s*[~\-]\s*(\d{1,2}):(\d{2})/)
  if (!m) return true
  const now = new Date()
  const cur = now.getHours() * 60 + now.getMinutes()
  const start = Number(m[1]) * 60 + Number(m[2])
  const end = Number(m[3]) * 60 + Number(m[4])
  return cur >= start && cur <= end
}

// ─── 서버 응답 → 뷰모델 ────────────────────────────────────────────────────────
// basePos = 기준점(내 위치 또는 서울시청). 항상 거리를 계산한다.
export function toLibrary(dto: LibraryResponse, basePos: LatLng): Library {
  const lat = Number(dto.latitude)
  const lng = Number(dto.longitude)
  const km = haversineKm(basePos, { lat, lng })
  return {
    id: dto.libId,
    name: dto.name,
    address: dto.address,
    sido: parseSido(dto.address),
    phone: dto.tel ?? '정보 없음',
    hours: dto.operatingHours ?? '정보 없음',
    closedDay: dto.closedDays ?? '휴관일 정보 없음',
    homepageUrl: dto.homepageUrl,
    type: dto.name.includes('국립') ? '국립' : '공공',
    isOpen: guessOpen(dto.operatingHours),
    lat,
    lng,
    distance: `${km.toFixed(1)}km`,
    distanceKm: km,
  }
}
