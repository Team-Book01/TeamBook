import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  LogOut,
  User,
  Lock,
  Trash2,
  Bell,
  Eye,
  Mail,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'
import { Switch } from '@/components/ui/Switch'
import { checkExists, logout as logoutApi } from '@/api/auth'
import { changePassword, updateNickname, withdraw } from '@/api/user'
import { getErrorMessage } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/lib/toast'

/**
 * 계정 설정 화면 (백엔드 연동).
 * - 닉네임: 입력 0.5초 후 /users/exists 로 1차 중복확인 → 저장 시 PATCH /users/me 에서 2차 검증
 * - 비밀번호: emailVerified 가 true 면 변경 폼, false 면 이메일 인증 안내(백엔드 미구현 → 준비중)
 * - 계정 삭제: 비밀번호 입력 후 DELETE /users/me
 */

type NickStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

// 닉네임 허용: 한글·영문·숫자·밑줄(_), 1~10자 (백엔드 규칙과 일치)
const NICKNAME_RE = /^[가-힣a-zA-Z0-9_]{1,10}$/

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

  // 입력이 끝난 0.5초 뒤 1차 중복확인 (DB 조회)
  useEffect(() => {
    const trimmed = nickname.trim()
    if (trimmed === '' || trimmed === currentNickname) {
      setNickStatus('idle')
      return
    }
    if (!NICKNAME_RE.test(trimmed)) {
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
      setNickStatus('taken') // 409(U003) 등
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

  const passwordValid = useMemo(() => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,15}$/
    return re.test(newPassword)
  }, [newPassword])

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
          <Link to="/" className="flex items-center gap-2">
            <BookOpen size={19} className="text-brand" />
            <span className="text-brand font-bold text-[17px] tracking-tight whitespace-nowrap">
              파노라마북스
            </span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="size-4" />
            로그아웃
          </Button>
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
                maxLength={10}
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

        {/* Password section */}
        <section
          className="mt-6 rounded-2xl border border-border bg-card p-6"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-3">
            <Lock className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">비밀번호 변경</h2>
          </div>
          <Separator className="my-4" />

          {user?.emailVerified ? (
            <form className="flex flex-col gap-4" onSubmit={handlePasswordSave} noValidate>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="currentPassword">현재 비밀번호</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="현재 비밀번호"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
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
                <Input
                  id="newPasswordConfirm"
                  name="newPasswordConfirm"
                  type="password"
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
                  {savingPassword ? '변경 중...' : '변경'}
                </Button>
              </div>
            </form>
          ) : (
            // 이메일 미인증 → 인증 안내 (백엔드 미구현이라 클릭 시 준비중)
            <div className="flex flex-col items-start gap-3 rounded-xl bg-secondary/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">이메일 인증이 필요합니다</p>
                  <p className="text-xs text-muted-foreground">
                    비밀번호를 변경하려면 먼저 이메일 인증을 완료해 주세요.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info('이메일 인증은 준비 중이에요.')}
              >
                이메일 인증하기
              </Button>
            </div>
          )}
        </section>

        {/* Notifications section (변경 없음) */}
        <section
          className="mt-6 rounded-2xl border border-border bg-card p-6"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-3">
            <Bell className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">알림 설정</h2>
          </div>
          <Separator className="my-4" />

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">독서 인증 리마인더</p>
                <p className="text-xs text-muted-foreground">매일 독서 인증을 잊지 않도록 알려드려요.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">새 리뷰·댓글 알림</p>
                <p className="text-xs text-muted-foreground">내 글에 달린 반응을 받아보세요.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">마케팅·이벤트</p>
                <p className="text-xs text-muted-foreground">책방의 새로운 소식과 이벤트를 받아보세요.</p>
              </div>
              <Switch />
            </div>
          </div>
        </section>

        {/* Privacy section (변경 없음) */}
        <section
          className="mt-6 rounded-2xl border border-border bg-card p-6"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-3">
            <Eye className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">프라이버시</h2>
          </div>
          <Separator className="my-4" />

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">프로필 공개</p>
                <p className="text-xs text-muted-foreground">다른 사용자가 내 프로필을 볼 수 있어요.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">독후감 공개</p>
                <p className="text-xs text-muted-foreground">작성한 독후감을 모두에게 공개할까요?</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </section>

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
              <Input
                id="deletePassword"
                type="password"
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
