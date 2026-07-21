import { useNavigate, useSearchParams } from 'react-router-dom'
import { Flame, TrendingUp } from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { usePopularPosts, useMyStats } from '@/api/community'
import { useRequireLogin } from '@/hooks/useRequireLogin'
import { MemberCard } from '@/components/common/MemberCard'

/** 사이드바에 보여줄 인기글 개수 */
const HOT_POST_COUNT = 5

/**
 * 커뮤니티 공용 사이드바 (목록/상세 페이지 공유).
 * - 회원 카드: authStore 로그인 사용자 + 작성글/스크랩 개수 (도서검색 회원 카드와 동일 형태).
 *   숫자 클릭 시 목록 영역이 "작성한 글 / 스크랩한 글" 로 전환된다(?view= 파라미터).
 * - 핫한 글: GET /posts/popular 상위 5건
 */
export default function CommunitySidebar() {
  const navigate = useNavigate()
  const { ensureLoggedIn } = useRequireLogin()
  const [searchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const { data, isLoading } = usePopularPosts()
  // 비로그인이면 훅 내부에서 호출 자체를 막는다(401 방지) → stats 는 undefined
  const { data: stats } = useMyStats()

  const activeView = searchParams.get('view') // 'posts' | 'scraps' | null
  // 아이디만 표시(소셜 계정은 provider). 도서검색 회원 카드와 동일 규칙.
  const handle = user ? (user.loginId ? `@${user.loginId}` : (user.provider ?? '')) : ''

  const hotPosts = (data?.pages[0]?.content ?? []).slice(0, HOT_POST_COUNT)

  return (
    <aside className="flex flex-col gap-5">
      {/* Profile card (도서검색 회원 카드와 동일 형태) */}
      <MemberCard
        nickname={user?.nickname ?? '로그인이 필요해요'}
        handle={handle}
        items={[
          {
            key: 'posts',
            label: '작성한 글',
            count: user ? (stats?.postCount ?? null) : null,
            active: activeView === 'posts',
            onClick: () => { if (ensureLoggedIn()) navigate('/community?view=posts') },
          },
          {
            key: 'scraps',
            label: '스크랩한 게시글',
            count: user ? (stats?.scrapCount ?? null) : null,
            active: activeView === 'scraps',
            onClick: () => { if (ensureLoggedIn()) navigate('/community?view=scraps') },
          },
        ]}
      />

      {/* Hot posts (인기글 API 상위 5건) */}
      <div className="bg-white border border-[#EAEAEA] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Flame size={16} color="#E07B00" />
          <h3 className="text-sm font-bold text-[#1A1A1A]">인기글</h3>
        </div>
        {isLoading ? (
          <p className="text-xs text-[#ccc] py-2">불러오는 중…</p>
        ) : hotPosts.length === 0 ? (
          <p className="text-xs text-[#ccc] py-2">아직 인기글이 없어요.</p>
        ) : (
          <ol className="divide-y divide-[#F5F5F5]">
            {hotPosts.map((post, idx) => (
              <li
                key={post.postId}
                onClick={() => navigate(`/community/${post.postId}`)}
                className="flex items-start gap-3 py-3 group cursor-pointer first:pt-0 last:pb-0"
              >
                <span
                  className="text-sm font-black w-5 text-center flex-shrink-0 mt-0.5"
                  style={{ color: idx < 3 ? '#F5B301' : '#ccc' }}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs text-[#444] line-clamp-2 group-hover:text-[#2E7D6B] transition-colors"
                    style={{ lineHeight: 1.6 }}
                  >
                    {post.title}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <TrendingUp size={10} color="#2E7D6B" />
                    <span className="text-[11px] text-[#bbb]">조회 {post.viewCount.toLocaleString()}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  )
}
