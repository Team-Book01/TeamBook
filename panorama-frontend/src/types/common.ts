/**
 * 여러 도메인이 공통으로 쓰는 타입.
 *
 * ⚠️ 타입 동기화 규칙: 이 파일과 domain별 타입 파일들은 백엔드 DTO(Java record) 기준으로
 *    "수기 동기화" 한다. 백엔드 DTO가 바뀌면 여기 타입도 직접 맞춰줘야 한다(자동 생성 아님).
 */

/**
 * 백엔드 공통 에러 응답 (global/exception/ErrorResponse).
 * 예: { "code": "INVALID_INPUT", "message": "검색어를 입력해주세요." }
 *
 * - code/message 는 필수 스펙이지만, 예상치 못한 서버/네트워크 오류 시 비어 있을 수 있어 optional 로 둔다.
 * - errors 는 @Valid 필드 검증 실패 시 필드별 사유(있을 때만 내려옴).
 */
export interface ErrorResponse {
  code?: string
  message?: string
  errors?: FieldError[]
}

export interface FieldError {
  field: string
  reason: string
}

/** 페이지네이션 요청 공통 파라미터 (page/size 방식) */
export interface PageParams {
  page?: number
  size?: number
}
