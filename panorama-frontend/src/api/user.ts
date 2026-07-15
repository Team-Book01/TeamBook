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
  emailVerified: boolean
}

function toUser(d: UserResponse): User {
  return {
    id: d.userId,
    nickname: d.nickname,
    email: '',
    role: d.role,
    loginId: d.loginId,
    provider: d.provider,
    emailVerified: d.emailVerified,
    avatarInitial: d.nickname.slice(0, 1),
  }
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
