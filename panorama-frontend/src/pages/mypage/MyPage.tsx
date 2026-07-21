import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  Bookmark,
  PenLine,
  Star,
  Heart,
  Settings,
  MessageSquareText,
  CalendarDays,
  ChevronRight,
  HelpCircle,
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
import { useMyPosts, useMyScraps, useMyStats } from '@/api/community'
import { useMyInquiries } from '@/api/inquiry'
import { getErrorMessage } from '@/api/client'
import { PostCard } from '@/pages/community/CommunityPage'
import MyInquiriesSection from './MyInquiriesSection'

/**
 * 마이페이지 화면. 4개 카드 모두 실제 API 연동.
 * - 저장한 책   : GET /api/v1/bookmark/myBookmarks, /myBookmarkCount
 * - 평가한 책   : GET /api/v1/reviews/myReviewList, /myReviewCount
 * - 작성한 게시글: GET /api/v1/members/me/posts (+ /me/stats postCount)
 * - 스크랩한 게시글: GET /api/v1/members/me/scraps (+ /me/stats scrapCount)
 */

type TabKey = 'bookmarks' | 'reviews' | 'posts' | 'scraps' | 'inquiries'

const TAB_KEYS: TabKey[] = ['bookmarks', 'reviews', 'posts', 'scraps', 'inquiries']
const isTabKey = (v: string | null): v is TabKey => v != null && (TAB_KEYS as string[]).includes(v)

/** ISO-8601 → 2026.07.01 */
function formatDate(iso?: string): string {
  if (!iso) return ''
  return iso.slice(0, 10).replaceAll('-', '.')
}

const menu: { key: TabKey; label: string; icon: typeof Star }[] = [
  { key: 'bookmarks', label: '저장한 책', icon: Heart },
  { key: 'reviews', label: '평가한 책', icon: Star },
  { key: 'posts', label: '작성한 게시글', icon: PenLine },
  { key: 'scraps', label: '스크랩한 게시글', icon: Bookmark },
  { key: 'inquiries', label: '나의 문의', icon: HelpCircle },
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

/** 카드 아이콘. 저장한 책만 빨간 하트(채움)로 렌더. */
function CardIcon({ tab, active }: { tab: TabKey; active?: boolean }) {
  const item = menu.find((m) => m.key === tab)!
  const Icon = item.icon
  if (tab === 'bookmarks') {
    return <Icon className={`size-5 ${active ? '' : 'text-rose-500'}`} fill="currentColor" />
  }
  return <Icon className={`size-5 ${active ? '' : 'text-primary'}`} />
}

export default function MyPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  // 선택 탭을 URL 쿼리(?tab=)에 보관한다. 도서 상세로 갔다가 브라우저 뒤로가기로 돌아와도
  // 보고 있던 탭이 그대로 복원된다(로컬 state 였을 땐 재마운트로 첫 탭으로 초기화됐다).
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const active: TabKey = isTabKey(tabParam) ? tabParam : 'bookmarks'
  const setActive = (key: TabKey) => setSearchParams({ tab: key }, { replace: true })
  const activeLabel = menu.find((m) => m.key === active)!.label

  // 이 페이지는 RequireAuth 로 보호되어 항상 로그인 사용자가 존재한다(토큰 인터셉터가 헤더를 실어준다).
  const reviewCountQuery = useMyReviewCount()
  const bookmarkCountQuery = useMyBookmarkCount()
  const statsQuery = useMyStats()
  // 목록은 해당 탭을 열었을 때만 조회한다(도서 API). 커뮤니티 목록은 훅 자체가 항상 조회.
  const reviewsQuery = useMyReviews({ enabled: active === 'reviews' })
  const bookmarksQuery = useMyBookmarks({ enabled: active === 'bookmarks' })
  const postsQuery = useMyPosts()
  const scrapsQuery = useMyScraps()
  // 나의 문의 개수(카드용). 목록/필터는 MyInquiriesSection 이 자체 조회하므로 여기선 총개수만.
  const inquiriesCountQuery = useMyInquiries({ page: 1, size: 1 })

  const reviews = reviewsQuery.data?.reviewItems ?? []
  const bookmarks = bookmarksQuery.data?.myBookmarkItems ?? []
  const posts = postsQuery.data?.pages.flatMap((p) => p.content) ?? []
  const scraps = scrapsQuery.data?.pages.flatMap((p) => p.content) ?? []

  // 개수는 전용 count/stats API 우선, 실패 시 목록 응답의 total 로 대체
  const reviewCount = reviewCountQuery.data ?? reviewsQuery.data?.total ?? 0
  const bookmarkCount = bookmarkCountQuery.data ?? bookmarksQuery.data?.total ?? 0
  const postCount = statsQuery.data?.postCount ?? null
  const scrapCount = statsQuery.data?.scrapCount ?? null
  const inquiryCount = inquiriesCountQuery.data?.totalElements ?? null

  /** 도서 상세로 이동 (isbn 이 없는 도서는 이동하지 않음) */
  const openBook = (isbn?: string) => {
    if (hasIsbn(isbn)) navigate(`/books/${isbn!.trim()}`)
  }

  const counts: Record<TabKey, number | null> = {
    bookmarks: bookmarkCount,
    reviews: reviewCount,
    posts: postCount,
    scraps: scrapCount,
    inquiries: inquiryCount,
  }

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
          <p className="mt-1 text-sm text-muted-foreground">{handle} · 회원</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/settings')}>
            <Settings className="size-4" />
            프로필 수정
          </Button>
        </div>
      </section>

      {/* 내 활동 카드 (통계 + 탭 전환을 한 줄로 통합) — 카드 크기·배치는 통계, 아이콘·동작은 메뉴 */}
      <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {menu.map((m) => {
          const isActive = m.key === active
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setActive(m.key)}
              className={`rounded-xl border p-5 text-left transition-colors ${
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-secondary/60'
              }`}
              style={isActive ? undefined : { boxShadow: 'var(--shadow-card)' }}
            >
              <CardIcon tab={m.key} active={isActive} />
              <p className="mt-3 text-3xl font-semibold">{counts[m.key] ?? '–'}</p>
              <p className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {m.label}
              </p>
            </button>
          )
        })}
      </section>

      {/* Selected list */}
      <section className="mt-10 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">{activeLabel}</h2>
          {/* 나의 문의는 섹션 내부에서 필터별 개수를 따로 보여주므로 여기선 생략 */}
          {activeTotal !== null && active !== 'inquiries' && (
            <span className="text-sm text-muted-foreground">총 {activeTotal}개</span>
          )}
        </div>

        {/* ── 나의 문의 ── */}
        {active === 'inquiries' && <MyInquiriesSection />}

        {/* ── 저장한 책 ── */}
        {active === 'bookmarks' && (
          <div className="mt-4 flex flex-col gap-4">
            <ListState
              isLoading={bookmarksQuery.isLoading}
              isError={bookmarksQuery.isError}
              error={bookmarksQuery.error}
              isEmpty={bookmarks.length === 0}
              emptyText="아직 저장한 책이 없습니다."
              errorText="저장한 책을 불러오지 못했습니다."
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

        {/* ── 평가한 책 ── */}
        {active === 'reviews' && (
          <div className="mt-4 flex flex-col gap-4">
            <ListState
              isLoading={reviewsQuery.isLoading}
              isError={reviewsQuery.isError}
              error={reviewsQuery.error}
              isEmpty={reviews.length === 0}
              emptyText="아직 평가한 책이 없습니다."
              errorText="평가한 책을 불러오지 못했습니다."
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
                      {[1, 2, 3, 4, 5].map((n) => {
                        const ratio = Math.min(Math.max(r.rating - (n - 1), 0), 1)
                        return (
                          <span key={n} className="relative inline-block size-3.5">
                            <Star className="absolute inset-0 size-3.5" fill="#E5E5E5" stroke="#E5E5E5" />
                            {ratio > 0 && (
                              <span
                                className="absolute inset-0 overflow-hidden"
                                style={{ width: `${ratio * 100}%` }}
                              >
                                <Star className="size-3.5" fill="#F5B301" stroke="#F5B301" />
                              </span>
                            )}
                          </span>
                        )
                      })}
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

        {/* ── 작성한 게시글 ── */}
        {active === 'posts' && (
          <div className="mt-4 flex flex-col gap-3">
            <ListState
              isLoading={postsQuery.isLoading}
              isError={postsQuery.isError}
              error={postsQuery.error}
              isEmpty={posts.length === 0}
              emptyText="아직 작성한 게시글이 없습니다."
              errorText="작성한 게시글을 불러오지 못했습니다."
            />
            {!postsQuery.isLoading &&
              !postsQuery.isError &&
              posts.map((post) => (
                <PostCard
                  key={post.postId}
                  post={post}
                  showCounts={false}
                  onOpen={() => navigate(`/community/${post.postId}`)}
                />
              ))}
          </div>
        )}

        {/* ── 스크랩한 게시글 ── */}
        {active === 'scraps' && (
          <div className="mt-4 flex flex-col gap-3">
            <ListState
              isLoading={scrapsQuery.isLoading}
              isError={scrapsQuery.isError}
              error={scrapsQuery.error}
              isEmpty={scraps.length === 0}
              emptyText="아직 스크랩한 게시글이 없습니다."
              errorText="스크랩한 게시글을 불러오지 못했습니다."
            />
            {!scrapsQuery.isLoading &&
              !scrapsQuery.isError &&
              scraps.map((post) => (
                <PostCard
                  key={post.postId}
                  post={post}
                  showCounts={false}
                  onOpen={() => navigate(`/community/${post.postId}`)}
                />
              ))}
          </div>
        )}
      </section>
    </div>
  )
}
