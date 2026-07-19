/**
 * 마이페이지/유저(user) 도메인 API 함수.
 */
import { client } from './client'
import type { User } from '@/types'

// ── queryKey 규칙: ['user', ...] ─────────────────────────────────────────────
export const userKeys = {
  all: ['user'] as const,
}

/** PATCH /users/me 응답 (백엔드 UserDto.Response 기준). */
interface UserResponse {
  userId: number
  loginId: string | null
  nickname: string
  profileImageUrl: string | null
  provider: 'LOCAL' | 'GOOGLE' | 'NAVER' | 'KAKAO'
  role: 'USER' | 'ADMIN'
  email: string | null
  emailVerified: boolean
}

function toUser(d: UserResponse): User {
  return {
    id: d.userId,
    nickname: d.nickname,
    email: d.email ?? '',
    role: d.role,
    loginId: d.loginId,
    provider: d.provider,
    emailVerified: d.emailVerified,
    avatarInitial: d.nickname.slice(0, 1),
  }
}

/** 현재 로그인 사용자 조회 (GET /users/me). 인터셉터가 access 토큰을 붙인다. */
export async function fetchMe(): Promise<User> {
  const { data } = await client.get<UserResponse>('/users/me')
  return toUser(data)
}

/**
 * 닉네임 변경 (PATCH /users/me). 변경된 내 정보 반환.
 * 백엔드가 중복(2차 검증)을 다시 확인해 중복이면 409(U003)로 응답한다.
 */
export async function updateNickname(nickname: string): Promise<User> {
  const { data } = await client.patch<UserResponse>('/users/me', { nickname })
  return toUser(data)
}

/**
 * 비밀번호 변경 (PATCH /users/me/password).
 * 현재 비밀번호 불일치 시 401(A009). (백엔드 로직은 확장 예정)
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await client.patch('/users/me/password', { currentPassword, newPassword })
}

/** 회원 탈퇴 (DELETE /users/me). */
export async function withdraw(): Promise<void> {
  await client.delete('/users/me')
}

/**
 * 이메일 등록·인증 요청 (POST /users/me/email). 인증 필요.
 * 입력한 이메일로 인증 링크 메일을 발송한다(202). 이미 사용 중이면 409(A010).
 * 인증 완료 전까지 users.email 에는 저장되지 않는다.
 */
export async function requestEmailVerification(email: string): Promise<void> {
  await client.post('/users/me/email', { email })
}
