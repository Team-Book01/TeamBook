import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Bookmark,
  PenLine,
  Star,
  Settings,
  LogOut,
  BadgeCheck,
  MessageSquareText,
  CalendarDays,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { logout as logoutApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/lib/toast'

/**
 * 마이페이지 화면 (UI 우선 이식본).
 * 프로필·목록 데이터는 목(mock)이며, 다음 단계에서 백엔드 API로 연결한다.
 */

type TabKey = 'reviews' | 'writings' | 'bookmarks' | 'certs'

type Post = {
  id: number
  book: string
  title: string
  excerpt: string
  date: string
  cover: string
}

const covers: Record<string, string> = {
  green: 'linear-gradient(150deg, oklch(0.55 0.09 158), oklch(0.36 0.07 165))',
  sage: 'linear-gradient(150deg, oklch(0.68 0.09 150), oklch(0.48 0.08 158))',
  moss: 'linear-gradient(150deg, oklch(0.6 0.1 145), oklch(0.4 0.08 160))',
  pine: 'linear-gradient(150deg, oklch(0.5 0.08 168), oklch(0.32 0.06 170))',
}

// TODO(백엔드 연동): 아래 목 데이터를 실제 API 응답으로 교체
const data: Record<TabKey, Post[]> = {
  reviews: [
    { id: 1, book: '데미안', title: '데미안', excerpt: '새는 알에서 나오려고 투쟁한다. 오래 곱씹게 되는 문장이 가득했다.', date: '2026.06.28', cover: covers.green },
    { id: 2, book: '코스모스', title: '코스모스', excerpt: '우주의 스케일 앞에서 겸손해지는 경험. 과학책의 정석.', date: '2026.05.14', cover: covers.pine },
    { id: 3, book: '노르웨이의 숲', title: '노르웨이의 숲', excerpt: '잔잔하지만 마음을 오래 흔드는 이야기. 계절이 바뀔 때 다시 읽고 싶다.', date: '2026.04.30', cover: covers.sage },
    { id: 4, book: '이기적 유전자', title: '이기적 유전자', excerpt: '생명을 보는 관점을 통째로 바꿔준 책. 밑줄이 끝없이 늘었다.', date: '2026.03.18', cover: covers.moss },
  ],
  writings: [
    { id: 1, book: '미움받을 용기', title: '타인의 시선에서 자유로워지기', excerpt: '모든 고민은 인간관계에서 비롯된다는 명제를 나에게 대입해 보았다.', date: '2026.06.10', cover: covers.sage },
    { id: 2, book: '총, 균, 쇠', title: '문명의 우연과 필연', excerpt: '지리적 조건이 역사를 어떻게 갈랐는지 정리하며 읽었다.', date: '2026.04.02', cover: covers.moss },
    { id: 3, book: '사피엔스', title: '허구가 만든 협력의 힘', excerpt: '인류가 어떻게 서로 다른 무리를 묶어 거대한 사회를 만들었는지 곱씹었다.', date: '2026.02.21', cover: covers.green },
  ],
  bookmarks: [
    { id: 1, book: '사피엔스', title: '사피엔스', excerpt: '유발 하라리 · 다음에 읽을 책', date: '2026.07.01', cover: covers.green },
    { id: 2, book: '1984', title: '1984', excerpt: '조지 오웰 · 재독 예정', date: '2026.06.20', cover: covers.pine },
    { id: 3, book: '어린 왕자', title: '어린 왕자', excerpt: '생텍쥐페리 · 선물용', date: '2026.06.05', cover: covers.sage },
    { id: 4, book: '밤의 도서관', title: '밤의 도서관', excerpt: '알베르토 망구엘 · 관심 도서', date: '2026.05.22', cover: covers.moss },
  ],
  certs: [
    { id: 1, book: '코스모스', title: '10일 연속 독서 인증', excerpt: '매일 저녁 30분씩, 코스모스를 완독하며 꾸준함을 기록했다.', date: '2026.06.30', cover: covers.pine },
    { id: 2, book: '데미안', title: '필사 인증', excerpt: '마음에 남은 문장을 손글씨로 옮겨 적었다.', date: '2026.06.12', cover: covers.green },
    { id: 3, book: '미움받을 용기', title: '완독 인증', excerpt: '3주에 걸쳐 완독. 오늘 마지막 장을 덮었다.', date: '2026.05.28', cover: covers.sage },
  ],
}

const menu: { key: TabKey; label: string; icon: typeof Star }[] = [
  { key: 'reviews', label: '작성한 리뷰', icon: Star },
  { key: 'writings', label: '독후감', icon: PenLine },
  { key: 'bookmarks', label: '북마크', icon: Bookmark },
  { key: 'certs', label: '독서 인증', icon: BadgeCheck },
]

const stats = [
  { label: '작성한 리뷰', value: data.reviews.length, icon: Star },
  { label: '독후감', value: data.writings.length, icon: PenLine },
  { label: '북마크', value: data.bookmarks.length, icon: Bookmark },
  { label: '독서 인증', value: data.certs.length, icon: BadgeCheck },
]

export default function MyPage() {
  const navigate = useNavigate()
  const storeLogout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const [active, setActive] = useState<TabKey>('reviews')
  const activeLabel = menu.find((m) => m.key === active)!.label
  const posts = data[active]

  // 이 페이지는 RequireAuth 로 보호되어 항상 로그인 사용자가 존재한다.
  const nickname = user?.nickname ?? ''
  // 로컬 계정은 아이디(@handle), 소셜 계정은 provider(GOOGLE/NAVER/KAKAO)로 계정 출처를 표기
  const handle = user?.loginId ? `@${user.loginId}` : (user?.provider ?? '')

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/mypage" className="font-display text-2xl font-semibold tracking-tight">
            책방<span className="text-accent">.</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
              <Settings className="size-4" />
              계정 설정
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Profile card */}
        <section
          className="flex flex-col items-start gap-6 rounded-2xl border border-border bg-card p-8 sm:flex-row sm:items-center"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex size-20 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
            {nickname.slice(0, 1)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{nickname}</h1>
              <Badge variant="brand" className="gap-1">
                <BookOpen className="size-3" />
                독서가
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{handle} · 책방 회원</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/settings')}>
              <Settings className="size-4" />
              프로필 수정
            </Button>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card p-5"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <s.icon className="size-5 text-primary" />
              <p className="mt-3 text-3xl font-semibold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Menu cards */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">내 활동</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {menu.map((m) => {
              const isActive = m.key === active
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setActive(m.key)}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-secondary/60'
                  }`}
                  style={isActive ? undefined : { boxShadow: 'var(--shadow-card)' }}
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                      isActive ? 'bg-primary-foreground/15' : 'bg-secondary'
                    }`}
                  >
                    <m.icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{m.label}</p>
                    <p
                      className={`text-xs ${
                        isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}
                    >
                      {data[m.key].length}개
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Selected post list */}
        <section className="mt-10 pb-16">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">{activeLabel}</h2>
            <span className="text-sm text-muted-foreground">총 {posts.length}개</span>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {posts.map((p) => (
              <article
                key={p.id}
                className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div
                  className="flex h-24 w-16 shrink-0 items-end rounded-md p-2"
                  style={{ background: p.cover }}
                >
                  <BookOpen className="size-4 text-white/85" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="truncate font-semibold">{p.title}</h3>
                    <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                  {p.book !== p.title && <p className="mt-0.5 text-xs text-primary">{p.book}</p>}
                  <p className="mt-2 line-clamp-2 flex items-start gap-2 text-sm text-foreground/80">
                    <MessageSquareText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    {p.excerpt}
                  </p>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    {p.date}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
