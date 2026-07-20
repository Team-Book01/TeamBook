import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import type { UseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query'

import type { PostSummary, SliceResponse } from '@/types/community'
import { useMyPosts, useMyScraps } from '@/api/community'
import { getErrorMessage } from '@/api/client'
import CommunityLayout from './components/CommunityLayout'
import { PostCard } from './CommunityPage'

type ListQuery = UseInfiniteQueryResult<InfiniteData<SliceResponse<PostSummary>>, Error>

/**
 * 내 작성글 / 내 스크랩 목록 화면.
 * 사이드바 프로필 카드의 숫자 클릭으로 진입한다.
 * - posts  : GET /members/me/posts
 * - scraps : GET /members/me/scraps
 *
 * 라우트별로 쓰는 훅이 달라, 뷰를 나눠 각자 자기 훅만 호출한다(불필요한 요청 방지).
 */
export default function CommunityMyListPage({ mode }: { mode: 'posts' | 'scraps' }) {
  return mode === 'posts' ? <MyPostsView /> : <MyScrapsView />
}

function MyPostsView() {
  return <ListShell title="내가 쓴 글" empty="아직 작성한 글이 없어요." query={useMyPosts()} />
}

function MyScrapsView() {
  return <ListShell title="스크랩한 글" empty="아직 스크랩한 글이 없어요." query={useMyScraps()} />
}

function ListShell({ title, empty, query }: { title: string; empty: string; query: ListQuery }) {
  const navigate = useNavigate()
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = query
  const posts = data?.pages.flatMap((p) => p.content) ?? []

  return (
    <CommunityLayout>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/community')}
          className="inline-flex items-center gap-1 text-xs text-[#aaa] hover:text-[#2E7D6B] transition-colors mb-2"
        >
          <ChevronLeft size={14} strokeWidth={2} />
          커뮤니티
        </button>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: '#1A1A1A' }}>
          {title}
        </h1>
      </div>

      {/* Post list */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="text-center py-20 text-[#ccc] text-sm">게시글을 불러오는 중…</div>
        ) : isError ? (
          <div className="text-center py-20 text-[#ccc] text-sm">
            {getErrorMessage(error, '게시글을 불러오지 못했어요.')}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-[#ccc] text-sm">{empty}</div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.postId}
              post={post}
              showCounts={false}
              onOpen={() => navigate(`/community/${post.postId}`)}
            />
          ))
        )}
      </div>

      {/* Load more */}
      {hasNextPage && (
        <div className="mt-8 text-center">
          <button
            onClick={() => fetchNextPage({ cancelRefetch: false })}
            disabled={isFetchingNextPage}
            className="text-sm font-semibold border rounded-xl px-8 py-3 bg-white transition-all hover:shadow-sm disabled:opacity-60"
            style={{ color: '#2E7D6B', borderColor: '#D5EAE4' }}
          >
            {isFetchingNextPage ? '불러오는 중…' : '게시글 더 보기'}
          </button>
        </div>
      )}
    </CommunityLayout>
  )
}
