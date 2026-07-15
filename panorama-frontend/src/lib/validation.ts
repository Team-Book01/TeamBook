/**
 * 폼 검증 공통 규칙.
 *
 * 백엔드 규칙과 반드시 일치시켜야 하는 정규식/길이를 한 곳에 모은다.
 * 규칙을 바꿀 때 이 파일만 수정하면 회원가입·계정설정 등 모든 화면에 반영된다.
 * (백엔드: com.teambook.panorama.global.constant.ValidationPattern)
 */

// ── 닉네임: 한글·영문·숫자·밑줄(_), 1~10자 ──────────────────────────
export const NICKNAME_MIN_LENGTH = 1
export const NICKNAME_MAX_LENGTH = 10
export const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9_]{1,10}$/
export const NICKNAME_MESSAGE = '닉네임은 1~10자, 한글·영문·숫자·밑줄(_)만 사용할 수 있어요.'
export function isValidNickname(value: string): boolean {
  return NICKNAME_REGEX.test(value)
}

// ── 로그인 아이디: 영문·숫자·밑줄(_)만(공백 불가), 6~15자 ───────────
export const LOGIN_ID_MIN_LENGTH = 6
export const LOGIN_ID_MAX_LENGTH = 15
export const LOGIN_ID_REGEX = /^[a-zA-Z0-9_]{6,15}$/
export const LOGIN_ID_MESSAGE = '아이디는 6~15자, 영문·숫자·밑줄(_)만 사용할 수 있어요.'
export function isValidLoginId(value: string): boolean {
  return LOGIN_ID_REGEX.test(value)
}

// ── 비밀번호: 대소문자·특수문자 포함, 공백 불가, 8~15자 ─────────────
// 백엔드 ValidationPattern.PASSWORD 와 동일한 의미(특수문자 = 영숫자·공백 이외 문자).
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 15
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9\s])\S{8,15}$/
export const PASSWORD_MESSAGE = '비밀번호는 8~15자, 대소문자·특수문자를 포함해야 해요.'
export function isValidPassword(value: string): boolean {
  return PASSWORD_REGEX.test(value)
}
