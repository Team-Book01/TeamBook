import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, PenLine, Eye, Heart, MessageCircle } from 'lucide-react'

import type { PostCategory, PostSummary } from '@/types/community'
import {
  usePosts,
  usePopularPosts,
  useMyPosts,
  useMyScraps,
  POST_CATEGORY_LABEL,
  POST_CATEGORY_BY_LABEL,
  POST_CATEGORIES,
  POST_PAGE_SIZE,
} from '@/api/community'
import { getErrorMessage } from '@/api/client'
import CategoryBadge from './components/CategoryBadge'
import CommunityLayout from './components/CommunityLayout'
import { formatRelativeTime, stripHtml } from './utils'

// ─── Tabs ─────────────────────────────────────────────────────────────────────
// 전체/카테고리 = GET /posts (category 파라미터로 서버 필터), 인기 = GET /posts/popular
type MainTab = '전체' | '인기' | PostCategory
const MAIN_TABS: MainTab[] = ['전체', '인기', ...POST_CATEGORIES]

function tabLabel(tab: MainTab): string {
  if (tab === '전체' || tab === '인기') return tab
  return POST_CATEGORY_LABEL[tab]
}

/**
 * URL ?tab= 파라미터를 MainTab 으로 변환.
 * 홈 바로가기가 넘기는 한국어 라벨('책추천'·'독후감'·'자유게시판')과 enum 을 모두 받는다.
 */
function parseTabParam(raw: string | null): MainTab {
  if (!raw) return '전체'
  if (raw === '전체' || raw === '인기') return raw
  if ((POST_CATEGORIES as readonly string[]).includes(raw)) return raw as PostCategory
  // 홈 라벨 매핑: 책추천→추천, 독후감→독후감, 자유게시판→자유
  const homeLabelToCategory: Record<string, PostCategory> = {
    책추천: 'RECOMMEND',
    독후감: 'REVIEW',
    자유게시판: 'FREE',
  }
  return homeLabelToCategory[raw] ?? POST_CATEGORY_BY_LABEL[raw] ?? '전체'
}

// 내 활동 보기(사이드바 진입): 작성한 글 / 스크랩한 글
type MyView = 'posts' | 'scraps'

// ─── Avatar ───────────────────────────────────────────────────────────────────

/** 닉네임에서 결정적으로 색을 뽑는다 (목데이터 authorColor 대체). */
const AVATAR_COLORS = ['#2E7D6B', '#4A7DB5', '#7B69B5', '#1E4A38', '#9B8BC4', '#B08000', '#C45C2E']
function avatarColor(nickname: string): string {
  let hash = 0
  for (const ch of nickname) hash = (hash * 31 + ch.charCodeAt(0)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function Avatar({ initial, color, size = 28 }: { initial: string; color: string; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-bold flex-shrink-0 text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
    >
      {initial}
    </span>
  )
}

// ─── Post Card ────────────────────────────────────────────────────────────────

// 내 글/스크랩 목록 페이지(CommunityMyListPage)에서도 동일 카드를 재사용한다.
// showCounts=false 면 조회/좋아요/댓글 수를 숨긴다 (내 글·스크랩 목록).
export function PostCard({
  post,
  onOpen,
  showCounts = true,
}: {
  post: PostSummary
  onOpen: () => void
  showCounts?: boolean
}) {
  return (
    <article
      onClick={onOpen}
      className="bg-white border border-[#EAEAEA] rounded-2xl p-6 hover:shadow-[0_4px_24px_rgba(30,74,56,0.09)] transition-all duration-200 cursor-pointer group"
    >
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Top: badge + book */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <CategoryBadge category={post.category} />
          {post.bookTitle && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold truncate max-w-[180px]" style={{ color: '#2E7D6B' }}>
                {post.bookTitle}
              </span>
              {post.author && (
                <>
                  <span className="text-[#ddd] text-xs">·</span>
                  <span className="text-xs text-[#bbb] truncate max-w-[100px]">{post.author}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold text-[#1A1A1A] leading-snug group-hover:text-[#1E4A38] transition-colors line-clamp-2">
          {post.title}
        </h3>

        {/* Preview */}
        <p className="text-sm text-[#888] line-clamp-2" style={{ lineHeight: 1.72 }}>
          {stripHtml(post.contentPreview)}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-2 pt-0.5">
          <Avatar initial={post.nickname.slice(0, 1)} color={avatarColor(post.nickname)} size={26} />
          <span className="text-xs font-semibold text-[#555]">{post.nickname}</span>
          <span className="text-[#ddd] text-xs">·</span>
          <span className="text-xs text-[#bbb]">{formatRelativeTime(post.createdAt)}</span>

          {showCounts && (
            <div className="ml-auto flex items-center gap-4">
              <span className="flex items-center gap-1 text-xs text-[#ccc]">
                <Eye size={13} strokeWidth={1.8} />
                <span>{post.viewCount.toLocaleString()}</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-[#bbb]">
                <Heart size={13} strokeWidth={1.8} />
                <span>{post.likeCount.toLocaleString()}</span>
              </span>
              <span className="flex items-center gap-1 text-xs" style={{ color: '#2E7D6B' }}>
                <MessageCircle size={13} strokeWidth={1.8} />
                <span>{post.commentCount.toLocaleString()}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // ?view=posts|scraps 면 "내 활동" 목록, 아니면 일반 게시판 목록
  const rawView = searchParams.get('view')
  const myView: MyView | null = rawView === 'posts' || rawView === 'scraps' ? rawView : null

  const [activeTab, setActiveTab] = useState<MainTab>(() => parseTabParam(searchParams.get('tab')))
  const [searchQuery, setSearchQuery] = useState('')
  const [feedSearchOpen, setFeedSearchOpen] = useState(false)

  // 일반 탭을 고르면 "내 활동" 보기(view 파라미터)를 해제한다.
  const selectMainTab = (tab: MainTab) => {
    setActiveTab(tab)
    if (myView) {
      const next = new URLSearchParams(searchParams)
      next.delete('view')
      setSearchParams(next, { replace: true })
    }
  }

  const selectMyView = (view: MyView) => {
    const next = new URLSearchParams(searchParams)
    next.set('view', view)
    setSearchParams(next, { replace: true })
  }

  const isPopularTab = activeTab === '인기'
  // 카테고리 탭이면 서버 필터용 enum, 전체/인기 탭이면 undefined(=필터 없음)
  const categoryParam = activeTab === '전체' || activeTab === '인기' ? undefined : activeTab

  // 전체/카테고리 탭 = GET /posts, 인기 탭 = GET /posts/popular
  // categoryParam 이 바뀌면 쿼리 키가 바뀌어 탭별로 커서·hasNextPage 가 독립적으로 관리된다.
  const allQuery = usePosts(POST_PAGE_SIZE, categoryParam)
  const popularQuery = usePopularPosts()
  const query = isPopularTab ? popularQuery : allQuery
  const {
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = query

  // ── 무한스크롤: 목록 하단 sentinel 이 뷰포트 하단 600px 안에 들어오면
  //    "더 보기" 버튼과 동일한 fetchNextPage 를 호출 (버튼은 수동 복구·즉시 로드용으로 유지)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  // observer 콜백이 항상 최신 쿼리 상태를 보도록 ref 로 전달 (stale closure 방지)
  const loadMoreRef = useRef({ hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage })
  loadMoreRef.current = { hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage }

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasNextPage) return // 마지막 페이지: observer 미생성 (기존 것은 cleanup 이 해제)
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        const q = loadMoreRef.current
        // 공유 가드: 로딩 중(중복 발사 방지)·마지막 페이지·직전 로드 실패(재시도는 버튼) 시 스킵
        if (!q.hasNextPage || q.isFetchingNextPage || q.isFetchNextPageError) return
        // cancelRefetch:false — 이미 로드 중이면 무시 (버튼과 동시 발화해도 요청 한 발)
        q.fetchNextPage({ cancelRefetch: false })
      },
      // 카드 1장 실측 180px + 목록 gap 12px = 192px → 600px = 카드 약 3장 앞에서 미리 발화
      { rootMargin: '0px 0px 600px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
    // activeTab 도 의존성에 포함: 탭이 바뀌면 목록이 통째로 갈리므로 observer 를 다시 만들어
    // sentinel 이 계속 화면에 머무는(=교차 이벤트가 새로 안 뜨는) 상태에서도 재발화하게 한다.
  }, [hasNextPage, activeTab])

  const posts = useMemo(() => {
    // 카테고리 필터는 서버(category 파라미터)가 처리하므로 여기선 검색어만 거른다.
    const loaded = query.data?.pages.flatMap((p) => p.content) ?? []
    if (!searchQuery.trim()) return loaded
    const q = searchQuery.trim()
    return loaded.filter(
      (p) => p.title.includes(q) || p.contentPreview.includes(q) || (p.bookTitle ?? '').includes(q),
    )
  }, [query.data, searchQuery])

  return (
    <CommunityLayout>
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#1A1A1A' }}>
            커뮤니티
          </h1>
          <p className="text-sm mt-1" style={{ color: '#999', lineHeight: 1.6 }}>
            다양한 책 이야기를 나누어 보세요
          </p>
        </div>

        <button
          onClick={() => navigate('/community/write')}
          className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
          style={{ background: '#1E4A38', color: '#fff', boxShadow: '0 2px 8px rgba(30,74,56,0.2)' }}
        >
          <PenLine size={15} strokeWidth={2.2} />
          새 글 작성
        </button>
      </div>

      {/* ── Tab bar + Search ─────────────────────────────────── */}
      <div className="flex items-center border-b border-[#EAEAEA]">
        <div className="flex flex-1">
          {MAIN_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => selectMainTab(tab)}
              className="relative px-4 py-3 text-sm font-semibold transition-colors flex-shrink-0"
              style={{ color: activeTab === tab && !myView ? '#2E7D6B' : '#aaa' }}
            >
              {tabLabel(tab)}
              {activeTab === tab && !myView && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: '#2E7D6B' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Expandable search (불러온 게시글 대상 클라이언트 검색) */}
        <div className="flex items-center gap-2 pb-2">
          <div
            className="flex items-center overflow-hidden transition-all duration-300 rounded-lg"
            style={{ width: feedSearchOpen ? 200 : 32 }}
          >
            {feedSearchOpen ? (
              <div className="flex items-center gap-1.5 border border-[#2E7D6B] rounded-lg px-2.5 py-1.5 w-full bg-white">
                <Search size={13} strokeWidth={1.8} color="#2E7D6B" className="flex-shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="검색어를 입력하세요"
                  onBlur={() => {
                    if (!searchQuery) setFeedSearchOpen(false)
                  }}
                  className="text-xs text-[#333] outline-none bg-transparent placeholder:text-[#ccc] w-full"
                />
              </div>
            ) : (
              <button
                onClick={() => setFeedSearchOpen(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#aaa] hover:text-[#333] hover:bg-[#F5F5F5] transition-colors"
              >
                <Search size={15} strokeWidth={1.8} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 내 활동 보기 (작성한 글 / 스크랩한 글) ─────────────── */}
      {myView ? (
        <MyActivitySection view={myView} onSelect={selectMyView} navigate={navigate} />
      ) : (
        <>
      {/* ── Post count ────────────────────────────────────────── */}
      <div className="flex items-center justify-between mt-4 mb-3">
        <p className="text-xs text-[#ccc]">
          게시글{' '}
          <span className="font-bold" style={{ color: '#2E7D6B' }}>
            {posts.length}
          </span>
          개
        </p>
      </div>

      {/* ── Post list ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="text-center py-20 text-[#ccc] text-sm">게시글을 불러오는 중…</div>
        ) : isError ? (
          <div className="text-center py-20 text-[#ccc] text-sm">
            {getErrorMessage(error, '게시글을 불러오지 못했어요.')}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-[#ccc] text-sm">
            {searchQuery ? '검색 결과가 없습니다.' : '아직 게시글이 없어요. 첫 글을 작성해 보세요!'}
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.postId}
              post={post}
              onOpen={() => navigate(`/community/${post.postId}`)}
            />
          ))
        )}
      </div>

      {/* 무한스크롤 sentinel — 고정 관찰 대상 (목록 항목 재관찰 방식 대신 rootMargin 으로 선발화) */}
      <div ref={sentinelRef} aria-hidden className="h-px" />

      {/* Load more */}
      {hasNextPage ? (
        <div className="mt-8 text-center">
          <button
            onClick={() => fetchNextPage({ cancelRefetch: false })}
            disabled={isFetchingNextPage}
            className="text-sm font-semibold border rounded-xl px-8 py-3 bg-white transition-all hover:shadow-sm disabled:opacity-60"
            style={{ color: '#2E7D6B', borderColor: '#D5EAE4' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#EFF6F2')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
          >
            {isFetchingNextPage ? '불러오는 중…' : '게시글 더 보기'}
          </button>
        </div>
      ) : !isLoading && !isError && posts.length > 0 ? (
        <div className="mt-8 text-center">
          <button
            disabled
            className="text-sm font-semibold border rounded-xl px-8 py-3 bg-white cursor-default"
            style={{ color: '#bbb', borderColor: '#EAEAEA' }}
          >
            마지막 글입니다
          </button>
        </div>
      ) : null}
        </>
      )}
    </CommunityLayout>
  )
}

// ─── 내 활동 섹션 (작성한 글 / 스크랩한 글) ─────────────────────────────────────
// 사이드바 회원 카드 클릭으로 진입. 탭으로 두 목록을 오갈 수 있다.
function MyActivitySection({
  view,
  onSelect,
  navigate,
}: {
  view: MyView
  onSelect: (v: MyView) => void
  navigate: (to: string) => void
}) {
  const postsQuery = useMyPosts()
  const scrapsQuery = useMyScraps()
  const query = view === 'posts' ? postsQuery : scrapsQuery
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = query
  const items = data?.pages.flatMap((p) => p.content) ?? []

  const TABS: { key: MyView; label: string }[] = [
    { key: 'posts', label: '작성한 글' },
    { key: 'scraps', label: '스크랩한 글' },
  ]

  return (
    <div className="mt-2">
      {/* 서브 탭 */}
      <div className="flex gap-1 mb-4 bg-[#F5F5F5] rounded-lg p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onSelect(t.key)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
              view === t.key ? 'bg-white text-[#2E7D6B] shadow-sm' : 'text-[#aaa] hover:text-[#555]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="text-center py-20 text-[#ccc] text-sm">불러오는 중…</div>
        ) : isError ? (
          <div className="text-center py-20 text-[#ccc] text-sm">
            {getErrorMessage(error, '목록을 불러오지 못했어요.')}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-[#ccc] text-sm">
            {view === 'posts' ? '아직 작성한 글이 없어요.' : '아직 스크랩한 글이 없어요.'}
          </div>
        ) : (
          items.map((post) => (
            <PostCard
              key={post.postId}
              post={post}
              showCounts={false}
              onOpen={() => navigate(`/community/${post.postId}`)}
            />
          ))
        )}
      </div>

      {hasNextPage && (
        <div className="mt-8 text-center">
          <button
            onClick={() => fetchNextPage({ cancelRefetch: false })}
            disabled={isFetchingNextPage}
            className="text-sm font-semibold border rounded-xl px-8 py-3 bg-white transition-all hover:shadow-sm disabled:opacity-60"
            style={{ color: '#2E7D6B', borderColor: '#D5EAE4' }}
          >
            {isFetchingNextPage ? '불러오는 중…' : '더 보기'}
          </button>
        </div>
      )}
    </div>
  )
}
