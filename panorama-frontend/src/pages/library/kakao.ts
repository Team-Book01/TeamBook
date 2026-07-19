/**
 * 카카오맵 JavaScript SDK 로더.
 *
 * - 키는 프론트 .env 의 VITE_KAKAO_MAP_JS_KEY (카카오 개발자 콘솔 > 앱 키 > JavaScript 키).
 *   이 키는 도메인 허용목록으로 보호되는 브라우저 공개용이라 VITE_ 노출이 정상이다.
 * - 카카오 콘솔 > 플랫폼 > Web 에 지도 페이지 origin(예: http://localhost:5173)을 등록해야 동작한다.
 * - autoload=false 로 받아서 kakao.maps.load() 콜백 이후에만 API 를 쓴다.
 * - libraries: services(좌표<->주소 변환 등), clusterer(마커 클러스터링 — 축소 시 수백 개 마커를 뭉침)
 */

// SDK 가 전역(window.kakao)에 주입된다. 타입 패키지가 없어 any 로 둔다.
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any
  }
}

let loadPromise: Promise<void> | null = null

export function loadKakaoMap(): Promise<void> {
  if (loadPromise) return loadPromise

  loadPromise = new Promise<void>((resolve, reject) => {
    const key = import.meta.env.VITE_KAKAO_MAP_JS_KEY as string | undefined
    if (!key) {
      reject(new Error('VITE_KAKAO_MAP_JS_KEY 가 설정되지 않았습니다. (.env 확인)'))
      return
    }
    // 이미 로드됨(재마운트 등)
    if (window.kakao?.maps) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=services,clusterer`
    script.async = true
    script.onload = () => window.kakao.maps.load(() => resolve())
    script.onerror = () =>
      reject(new Error('카카오맵 SDK 로드에 실패했습니다. (JavaScript 키·도메인 등록 확인)'))
    document.head.appendChild(script)
  })

  // 실패 시 다음 시도에서 재로딩할 수 있도록 캐시를 비운다.
  loadPromise.catch(() => {
    loadPromise = null
  })

  return loadPromise
}
