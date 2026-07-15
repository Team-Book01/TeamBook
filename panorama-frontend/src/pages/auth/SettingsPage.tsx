import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  LogOut,
  User,
  Lock,
  Trash2,
  Bell,
  Eye,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'
import { Switch } from '@/components/ui/Switch'
import { logout as logoutApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/lib/toast'

/**
 * 계정 설정 화면 (UI 우선 이식본).
 * 프로필/비밀번호 저장·닉네임 중복 확인은 목(mock) 처리이며,
 * 다음 단계에서 백엔드 API로 연결한다.
 */

// TODO(백엔드 연동): 로그인 사용자 프로필로 교체
const mockProfile = { nickname: '책읽는곰', login_id: 'bookbear' }
// 닉네임 중복 확인 목킹용 (백엔드 연동 시 API 로 대체)
const TAKEN_NICKNAMES = ['admin', 'test', '책방']

type NickStatus = 'idle' | 'checking' | 'available' | 'taken'

export default function SettingsPage() {
  const navigate = useNavigate()
  const storeLogout = useAuthStore((s) => s.logout)

  // 닉네임 상태
  const initialNickname = mockProfile.nickname
  const [nickname, setNickname] = useState(initialNickname)
  const [nickStatus, setNickStatus] = useState<NickStatus>('idle')
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    const trimmed = nickname.trim()
    if (trimmed === '' || trimmed === initialNickname) {
      setNickStatus('idle')
      return
    }
    setNickStatus('checking')
    const timer = setTimeout(() => {
      // TODO(백엔드 연동): 실제 닉네임 중복 확인 API 로 교체
      setNickStatus(TAKEN_NICKNAMES.includes(trimmed) ? 'taken' : 'available')
    }, 500)
    return () => clearTimeout(timer)
  }, [nickname, initialNickname])

  // 비밀번호 상태
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const passwordValid = useMemo(() => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,15}$/
    return re.test(newPassword)
  }, [newPassword])

  const confirmMatch = confirmPassword.length > 0 && newPassword === confirmPassword

  const profileCanSave = nickStatus === 'available' || nickname.trim() === initialNickname
  const passwordCanSave = passwordValid && confirmMatch

  async function handleLogout() {
    try {
      await logoutApi() // 백엔드: refresh 토큰 삭제 + 쿠키 만료
    } catch {
      // 서버 로그아웃이 실패해도 로컬 상태는 정리한다
    }
    storeLogout() // zustand 전역 상태 초기화
    toast.success('로그아웃되었습니다.')
    navigate('/login', { replace: true })
  }

  function handleProfileSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!profileCanSave) return
    const trimmed = nickname.trim()
    if (trimmed === initialNickname) return
    setSavingProfile(true)
    // TODO(백엔드 연동): 프로필 저장 API 호출
    setTimeout(() => {
      setSavingProfile(false)
      toast.success('프로필이 저장되었습니다.')
    }, 300)
  }

  function handlePasswordSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!passwordCanSave) return
    setSavingPassword(true)
    // TODO(백엔드 연동): 비밀번호 변경 API 호출
    setTimeout(() => {
      setSavingPassword(false)
      toast.success('비밀번호가 변경되었습니다.')
      setNewPassword('')
      setConfirmPassword('')
    }, 300)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            to="/mypage"
            className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight"
          >
            <ArrowLeft className="size-5" />
            책방<span className="text-accent">.</span>
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
              책
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
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="loginId">아이디</Label>
                <Input id="loginId" name="loginId" value={mockProfile.login_id} disabled />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={!profileCanSave || savingProfile}>
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

          <form className="flex flex-col gap-4" onSubmit={handlePasswordSave} noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currentPassword">현재 비밀번호</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="현재 비밀번호"
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
        </section>

        {/* Notifications section */}
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

        {/* Privacy section */}
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
            <Button
              variant="destructive"
              size="sm"
              onClick={() => toast.error('계정 삭제는 준비 중이에요.')}
            >
              계정 삭제
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
