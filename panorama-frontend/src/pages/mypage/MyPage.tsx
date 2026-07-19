import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Bookmark,
  PenLine,
  Star,
  Settings,
  BadgeCheck,
  MessageSquareText,
  CalendarDays,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import {
  hasIsbn,
  useMyBookmarkCount,
  useMyBookmarks,
  useMyReviewCount,
  useMyReviews,
} from '@/api/book'
import { getErrorMessage } from '@/api/client'

/**
 * 마이페이지 화면.
 * - "작성한 리뷰" / "북마크" 는 백엔드 book 도메인 API 연동:
 *   GET /api/v1/reviews/myReviewList, /myReviewCount
 *   GET /api/v1/bookmark/myBookmarks, /myBookmarkCount
 * - "독후감"(커뮤니티) / "독서 인증" 은 담당 도메인 API 미구현 → 준비 중 안내.
 */

type TabKey = 'reviews' | 'writings' | 'bookmarks' | 'certs'

/** ISO-8601 → 2026.07.01 */
function formatDate(iso?: string): string {
  if (!iso) return ''
  return iso.slice(0, 10).replaceAll('-', '.')
}

const menu: { key: TabKey; label: string; icon: typeof Star }[] = [
  { key: 'reviews', label: '작성한 리뷰', icon: Star },
  { key: 'writings', label: '독후감', icon: PenLine },
  { key: 'bookmarks', label: '북마크', icon: Bookmark },
  { key: 'certs', label: '독서 인증', icon: BadgeCheck },
]

/** 표지 이미지 (없으면 아이콘 플레이스홀더) */
function Cover({ src, alt }: { src?: string; alt: string }) {
  const [error, setError] = useState(false)
  if (!src || error) {
    return (
      <div className="flex h-24 w-16 shrink-0 items-end rounded-md bg-secondary p-2">
        <BookOpen className="size-4 text-muted-foreground" />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className="h-24 w-16 shrink-0 rounded-md object-cover"
    />
  )
}

/** 목록 공통 상태(로딩/에러/빈 값) 렌더 */
function ListState({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyText,
  errorText,
}: {
  isLoading: boolean
  isError: boolean
  error: unknown
  isEmpty: boolean
  emptyText: string
  errorText: string
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }
  if (isError) {
    return (
      <p className="py-16 text-center text-sm text-rose-500">
        {getErrorMessage(error, errorText)}
      </p>
    )
  }
  if (isEmpty) {
    return <p className="py-16 text-center text-sm text-muted-foreground">{emptyText}</p>
  }
  return null
}

export default function MyPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [active, setActive] = useState<TabKey>('reviews')
  const activeLabel = menu.find((m) => m.key === active)!.label

  // 이 페이지는 RequireAuth 로 보호되어 항상 로그인 사용자가 존재한다(토큰 인터셉터가 헤더를 실어준다).
  const reviewCountQuery = useMyReviewCount()
  const bookmarkCountQuery = useMyBookmarkCount()
  // 목록은 해당 탭을 열었을 때만 조회한다.
  const reviewsQuery = useMyReviews({ enabled: active === 'reviews' })
  const bookmarksQuery = useMyBookmarks({ enabled: active === 'bookmarks' })

  const reviews = reviewsQuery.data?.reviewItems ?? []
  const bookmarks = bookmarksQuery.data?.myBookmarkItems ?? []

  // 개수는 전용 count API 우선, 실패 시 목록 응답의 total 로 대체
  const reviewCount = reviewCountQuery.data ?? reviewsQuery.data?.total ?? 0
  const bookmarkCount = bookmarkCountQuery.data ?? bookmarksQuery.data?.total ?? 0

  /** 도서 상세로 이동 (isbn 이 없는 도서는 이동하지 않음) */
  const openBook = (isbn?: string) => {
    if (hasIsbn(isbn)) navigate(`/books/${isbn!.trim()}`)
  }

  const counts: Record<TabKey, number | null> = {
    reviews: reviewCount,
    writings: null, // 커뮤니티 API 미연동
    bookmarks: bookmarkCount,
    certs: null, // 독서 인증 API 미구현
  }

  const stats = [
    { label: '작성한 리뷰', value: reviewCount, icon: Star },
    { label: '독후감', value: null, icon: PenLine },
    { label: '북마크', value: bookmarkCount, icon: Bookmark },
    { label: '독서 인증', value: null, icon: BadgeCheck },
  ]

  const nickname = user?.nickname ?? ''
  // 로컬 계정은 아이디(@handle), 소셜 계정은 provider(GOOGLE/NAVER/KAKAO)로 계정 출처를 표기
  const handle = user?.loginId ? `@${user.loginId}` : (user?.provider ?? '')

  const activeTotal = counts[active]

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
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
            <p className="mt-3 text-3xl font-semibold">{s.value ?? '–'}</p>
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
            const count = counts[m.key]
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
                    {count === null ? '준비 중' : `${count}개`}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Selected list */}
      <section className="mt-10 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">{activeLabel}</h2>
          {activeTotal !== null && (
            <span className="text-sm text-muted-foreground">총 {activeTotal}개</span>
          )}
        </div>

        {/* ── 작성한 리뷰 ── */}
        {active === 'reviews' && (
          <div className="mt-4 flex flex-col gap-4">
            <ListState
              isLoading={reviewsQuery.isLoading}
              isError={reviewsQuery.isError}
              error={reviewsQuery.error}
              isEmpty={reviews.length === 0}
              emptyText="아직 작성한 리뷰가 없습니다."
              errorText="리뷰를 불러오지 못했습니다."
            />
            {!reviewsQuery.isLoading &&
              !reviewsQuery.isError &&
              reviews.map((r) => (
                <article
                  key={r.reviewId}
                  onClick={() => openBook(r.isbn)}
                  className={`group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 ${
                    hasIsbn(r.isbn) ? 'cursor-pointer' : ''
                  }`}
                  style={{ boxShadow: 'var(--shadow-card)' }}
                >
                  <Cover src={r.bookImage} alt={r.bookTitle} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="truncate font-semibold">{r.bookTitle}</h3>
                      {hasIsbn(r.isbn) && (
                        <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className="size-3.5"
                          fill={n <= Math.round(r.rating) ? '#F5B301' : '#E5E5E5'}
                          stroke={n <= Math.round(r.rating) ? '#F5B301' : '#E5E5E5'}
                        />
                      ))}
                      <span className="ml-1 text-xs text-muted-foreground">
                        {Number(r.rating).toFixed(1)}
                      </span>
                    </div>
                    {r.content && (
                      <p className="mt-2 line-clamp-2 flex items-start gap-2 text-sm text-foreground/80">
                        <MessageSquareText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        {r.content}
                      </p>
                    )}
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      {formatDate(r.createdAt)}
                    </p>
                  </div>
                </article>
              ))}
          </div>
        )}

        {/* ── 북마크 ── */}
        {active === 'bookmarks' && (
          <div className="mt-4 flex flex-col gap-4">
            <ListState
              isLoading={bookmarksQuery.isLoading}
              isError={bookmarksQuery.isError}
              error={bookmarksQuery.error}
              isEmpty={bookmarks.length === 0}
              emptyText="아직 북마크한 도서가 없습니다."
              errorText="북마크를 불러오지 못했습니다."
            />
            {!bookmarksQuery.isLoading &&
              !bookmarksQuery.isError &&
              bookmarks.map((b) => (
                <article
                  key={b.isbn}
                  onClick={() => openBook(b.isbn)}
                  className={`group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 ${
                    hasIsbn(b.isbn) ? 'cursor-pointer' : ''
                  }`}
                  style={{ boxShadow: 'var(--shadow-card)' }}
                >
                  <Cover src={b.bookImage} alt={b.bookTitle} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="truncate font-semibold">{b.bookTitle}</h3>
                      {hasIsbn(b.isbn) && (
                        <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      )}
                    </div>
                    {b.author && <p className="mt-0.5 text-xs text-primary">{b.author}</p>}
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      {formatDate(b.createdAt)} 저장
                    </p>
                  </div>
                </article>
              ))}
          </div>
        )}

        {/* ── 독후감 / 독서 인증 — 담당 도메인 API 미연동 ── */}
        {(active === 'writings' || active === 'certs') && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {activeLabel} 기능은 준비 중입니다.
          </p>
        )}
      </section>
    </div>
  )
}
