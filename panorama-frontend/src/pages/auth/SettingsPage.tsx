import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  LogOut,
  User,
  Lock,
  Trash2,
  Mail,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Separator } from '@/components/ui/Separator'
import { checkExists, logout as logoutApi } from '@/api/auth'
import { changePassword, updateNickname, withdraw, requestEmailVerification, fetchMe } from '@/api/user'
import { getErrorCode, getErrorMessage } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/lib/toast'
import { isValidNickname, isValidPassword, NICKNAME_MAX_LENGTH } from '@/lib/validation'

/**
 * 계정 설정 화면 (백엔드 연동).
 * - 닉네임: 입력 0.5초 후 /users/exists 로 1차 중복확인 → 저장 시 PATCH /users/me 에서 2차 검증
 * - 비밀번호 수정: 현재/새 비밀번호로 PATCH /users/me/password (로컬 계정만)
 * - 이메일 인증: 이메일 입력 → POST /users/me/email 로 인증 링크 메일 발송(링크 방식). 완료는 /verify-email
 * - 계정 삭제: 비밀번호 입력 후 DELETE /users/me
 */

type NickStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

export default function SettingsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const storeLogout = useAuthStore((s) => s.logout)

  const currentNickname = user?.nickname ?? ''

  // ── 닉네임 ─────────────────────────────────────────────
  const [nickname, setNickname] = useState(currentNickname)
  const [nickStatus, setNickStatus] = useState<NickStatus>('idle')
  const [savingProfile, setSavingProfile] = useState(false)

  // 로그인 사용자 로드/변경 시 입력값 동기화
  useEffect(() => {
    setNickname(currentNickname)
  }, [currentNickname])

  // 화면 진입 시 내 정보를 최신화한다. (다른 탭에서 이메일 인증을 마치고 돌아왔을 때 인증 상태 반영)
  useEffect(() => {
    fetchMe()
      .then(setUser)
      .catch(() => {
        /* 실패 시 기존 스토어 값 유지 */
      })
  }, [setUser])

  // 입력이 끝난 0.5초 뒤 1차 중복확인 (DB 조회)
  useEffect(() => {
    const trimmed = nickname.trim()
    if (trimmed === '' || trimmed === currentNickname) {
      setNickStatus('idle')
      return
    }
    if (!isValidNickname(trimmed)) {
      setNickStatus('invalid') // 형식 위반 → 중복확인 API 호출 안 함
      return
    }
    setNickStatus('checking')
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const taken = await checkExists({ nickname: trimmed }) // 1차 검증
        if (!cancelled) setNickStatus(taken ? 'taken' : 'available')
      } catch {
        if (!cancelled) setNickStatus('idle')
      }
    }, 500)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [nickname, currentNickname])

  async function handleProfileSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = nickname.trim()
    if (nickStatus !== 'available' || trimmed === currentNickname) return
    setSavingProfile(true)
    try {
      const updated = await updateNickname(trimmed) // 백엔드에서 2차 중복 검증
      setUser(updated) // 스토어 갱신 → 화면 반영
      setNickStatus('idle')
      toast.success('닉네임이 변경되었습니다.')
    } catch (err) {
      // U003(닉네임 중복)일 때만 '중복' 안내. 네트워크/500 등은 일반 에러로 구분한다.
      if (getErrorCode(err) === 'U003') setNickStatus('taken')
      else setNickStatus('idle')
      toast.error(getErrorMessage(err, '닉네임 변경에 실패했어요.'))
    } finally {
      setSavingProfile(false)
    }
  }

  // ── 비밀번호 변경 (emailVerified 인 경우만 노출) ─────────
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const passwordValid = useMemo(() => isValidPassword(newPassword), [newPassword])

  const confirmMatch = confirmPassword.length > 0 && newPassword === confirmPassword
  const passwordCanSave = currentPassword.length > 0 && passwordValid && confirmMatch

  async function handlePasswordSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!passwordCanSave) return
    setSavingPassword(true)
    try {
      await changePassword(currentPassword, newPassword)
      toast.success('비밀번호가 변경되었습니다.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(getErrorMessage(err, '비밀번호 변경에 실패했어요.'))
    } finally {
      setSavingPassword(false)
    }
  }

  // ── 이메일 등록·인증 (비밀번호 찾기 활성화용) ────────────
  // 링크 방식: 이메일 입력 → 인증 메일 발송 → 메일의 링크(/verify-email)를 눌러 완료.
  const [emailInput, setEmailInput] = useState('')
  const [sendingMail, setSendingMail] = useState(false)
  const [mailSent, setMailSent] = useState(false)
  const alreadyVerified = Boolean(user?.emailVerified)

  const emailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim())

  async function handleSendVerificationMail() {
    if (!emailFormatValid) return
    setSendingMail(true)
    try {
      await requestEmailVerification(emailInput.trim())
      setMailSent(true)
      toast.success('인증 메일을 보냈어요. 메일의 링크를 눌러 인증을 완료해 주세요.')
    } catch (err) {
      toast.error(getErrorMessage(err, '인증 메일 발송에 실패했어요.'))
    } finally {
      setSendingMail(false)
    }
  }

  // ── 계정 삭제 ─────────────────────────────────────────
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!deletePassword) return
    setDeleting(true)
    try {
      // NOTE: 비밀번호 검증 전용 백엔드 엔드포인트가 아직 없어, 입력 확인 후 탈퇴를 호출한다.
      //       (검증 엔드포인트가 생기면 삭제 전에 비밀번호 검증 호출을 추가)
      await withdraw()
      storeLogout()
      toast.success('계정이 삭제되었습니다.')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err, '계정 삭제에 실패했어요.'))
    } finally {
      setDeleting(false)
    }
  }

  async function handleLogout() {
    try {
      await logoutApi()
    } catch {
      // 서버 로그아웃이 실패해도 로컬 상태는 정리한다
    }
    storeLogout()
    toast.success('로그아웃되었습니다.')
    navigate('/login', { replace: true })
  }

  const avatarInitial = (user?.nickname ?? '책').slice(0, 1)

  // 닉네임 옆 읽기전용 필드: 로컬 계정은 아이디(login_id), 소셜 계정은 provider(영문 대문자)
  const isLocalAccount = user?.provider === 'LOCAL'
  const accountFieldLabel = isLocalAccount ? '아이디' : '소셜'
  const accountFieldValue = isLocalAccount ? (user?.loginId ?? '') : (user?.provider ?? '')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <BookOpen size={19} className="text-brand" />
            <span className="text-brand font-bold text-[17px] tracking-tight whitespace-nowrap">
              파노라마북스
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              to="/mypage"
              className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-point"
            >
              <User size={15} />
              마이페이지
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">계정 설정</h1>
        <p className="mt-1 text-sm text-muted-foreground">프로필과 계정 정보를 관리하세요.</p>

        {/* Profile section */}
        <section
          className="mt-8 rounded-2xl border border-border bg-card p-6"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-3">
            <User className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">프로필</h2>
          </div>
          <Separator className="my-4" />

          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
              {avatarInitial}
            </div>
            <div className="flex flex-col gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info('프로필 사진 변경은 준비 중이에요.')}
              >
                사진 변경
              </Button>
              <p className="text-xs text-muted-foreground">PNG, JPG, WEBP 최대 2MB</p>
            </div>
          </div>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleProfileSave} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                name="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                autoComplete="off"
                maxLength={NICKNAME_MAX_LENGTH}
              />
              <div className="min-h-[1.25rem] text-xs">
                {nickStatus === 'checking' && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    확인 중...
                  </span>
                )}
                {nickStatus === 'available' && (
                  <span className="flex items-center gap-1 text-primary">
                    <CheckCircle2 className="size-3" />
                    사용 가능한 닉네임입니다
                  </span>
                )}
                {nickStatus === 'taken' && (
                  <span className="flex items-center gap-1 text-destructive">
                    <XCircle className="size-3" />
                    중복된 닉네임입니다
                  </span>
                )}
                {nickStatus === 'invalid' && (
                  <span className="flex items-center gap-1 text-destructive">
                    <XCircle className="size-3" />
                    한글·영문·숫자·밑줄(_)만, 1~10자
                  </span>
                )}
              </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="account">{accountFieldLabel}</Label>
                <Input id="account" value={accountFieldValue} disabled />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={nickStatus !== 'available' || savingProfile}
              >
                {savingProfile ? '저장 중...' : '저장'}
              </Button>
            </div>
          </form>
        </section>

        {/* Password section (소셜 계정은 비밀번호가 없으므로 미노출) */}
        {isLocalAccount && (
        <section
          className="mt-6 rounded-2xl border border-border bg-card p-6"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-3">
            <Lock className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">비밀번호 수정</h2>
          </div>
          <Separator className="my-4" />

          <form className="flex flex-col gap-4" onSubmit={handlePasswordSave} noValidate>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="currentPassword">현재 비밀번호</Label>
                <PasswordInput
                  id="currentPassword"
                  name="currentPassword"
                  placeholder="현재 비밀번호"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <PasswordInput
                  id="newPassword"
                  name="newPassword"
                  placeholder="8~15자, 대소문자·특수문자 포함"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <div className="min-h-[1.25rem] text-xs">
                  {newPassword.length > 0 && !passwordValid && (
                    <span className="flex items-center gap-1 text-destructive">
                      <XCircle className="size-3" />
                      비밀번호는 8~15자, 대소문자·특수문자를 포함해야 합니다
                    </span>
                  )}
                  {newPassword.length > 0 && passwordValid && (
                    <span className="flex items-center gap-1 text-primary">
                      <CheckCircle2 className="size-3" />
                      사용 가능한 비밀번호입니다
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newPasswordConfirm">새 비밀번호 확인</Label>
                <PasswordInput
                  id="newPasswordConfirm"
                  name="newPasswordConfirm"
                  placeholder="비밀번호를 다시 입력"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <div className="min-h-[1.25rem] text-xs">
                  {confirmPassword.length > 0 && !confirmMatch && (
                    <span className="flex items-center gap-1 text-destructive">
                      <XCircle className="size-3" />
                      비밀번호가 일치하지 않습니다
                    </span>
                  )}
                  {confirmPassword.length > 0 && confirmMatch && (
                    <span className="flex items-center gap-1 text-primary">
                      <CheckCircle2 className="size-3" />
                      비밀번호가 일치합니다
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={!passwordCanSave || savingPassword}>
                  {savingPassword ? '변경 중...' : '수정'}
                </Button>
              </div>
            </form>
        </section>
        )}

        {/* Email 등록·인증 (로컬 계정만 · 비밀번호 찾기 활성화용) */}
        {isLocalAccount && (
        <section
          className="mt-6 rounded-2xl border border-border bg-card p-6"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-3">
            <Mail className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">이메일 인증</h2>
          </div>
          <Separator className="my-4" />
          <p className="text-xs text-muted-foreground">
            이메일을 등록·인증해 두면 비밀번호를 잊었을 때 로그인 화면의 &lsquo;비밀번호 찾기&rsquo;로
            재설정할 수 있어요.
          </p>

          {alreadyVerified ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-secondary/50 p-4 text-sm">
              <CheckCircle2 className="size-4 shrink-0 text-primary" />
              <span>
                {user?.email ? (
                  <>
                    인증된 이메일: <span className="font-medium text-foreground">{user.email}</span>
                  </>
                ) : (
                  '이메일 인증이 완료된 계정입니다.'
                )}
              </span>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="verifyEmail">이메일</Label>
                <div className="flex gap-2">
                  <Input
                    id="verifyEmail"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value)
                      setMailSent(false)
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={handleSendVerificationMail}
                    disabled={!emailFormatValid || sendingMail}
                  >
                    {sendingMail ? '보내는 중...' : mailSent ? '재발송' : '인증 메일 보내기'}
                  </Button>
                </div>
              </div>

              {mailSent && (
                <div className="flex items-start gap-2 rounded-xl bg-secondary/50 p-4 text-xs text-muted-foreground">
                  <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    <span className="font-medium text-foreground">{emailInput.trim()}</span> 로 인증 링크를
                    보냈어요. 메일의 링크를 눌러 인증을 완료해 주세요. (30분 내 유효)
                  </span>
                </div>
              )}
            </div>
          )}
        </section>
        )}

        {/* Danger zone */}
        <section className="mt-6 rounded-2xl border border-destructive/20 bg-card p-6">
          <div className="flex items-center gap-3">
            <Trash2 className="size-5 text-destructive" />
            <h2 className="text-lg font-semibold text-destructive">위험 구역</h2>
          </div>
          <Separator className="my-4" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">계정 삭제</p>
              <p className="text-xs text-muted-foreground">계정과 모든 데이터가 영구적으로 삭제됩니다.</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              계정 삭제
            </Button>
          </div>
        </section>
      </main>

      {/* 계정 삭제 확인 모달 */}
      {deleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !deleting && setDeleteOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <Trash2 className="size-5 text-destructive" />
              <h3 className="text-lg font-semibold text-destructive">계정 삭제</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              본인 확인을 위해 비밀번호를 입력해 주세요. 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="mt-4 flex flex-col gap-1.5">
              <Label htmlFor="deletePassword">비밀번호</Label>
              <PasswordInput
                id="deletePassword"
                placeholder="현재 비밀번호"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
              >
                취소
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={!deletePassword || deleting}
              >
                {deleting ? '삭제 중...' : '삭제'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
