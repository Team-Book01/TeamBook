/**
 * 임시 toast 스텁 (UI 우선 이식용).
 *
 * test 초안은 sonner 를 썼지만 기존 프로젝트엔 toast 시스템이 없어,
 * 우선 window.alert 로 최소 동작만 대체한다.
 * 백엔드 연동 단계에서 실제 toast 라이브러리(sonner 등)로 교체 예정.
 */
type ToastFn = (message: string) => void

export const toast: { success: ToastFn; error: ToastFn; info: ToastFn } = {
  success: (message) => window.alert(message),
  error: (message) => window.alert(message),
  info: (message) => window.alert(message),
}
