import { useNavigate } from 'react-router-dom'
import { Flame, TrendingUp } from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { usePopularPosts, useMyStats } from '@/api/community'

/** 사이드바에 보여줄 인기글 개수 */
const HOT_POST_COUNT = 5

/**
 * 커뮤니티 공용 사이드바 (목록/상세 페이지 공유).
 * - 프로필 카드: authStore 의 로그인 사용자 정보
 * - 핫한 글: GET /posts/popular 상위 5건
 */
export default function CommunitySidebar() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data, isLoading } = usePopularPosts()
  // 비로그인이면 훅 내부에서 호출 자체를 막는다(401 방지) → stats 는 undefined
  const { data: stats, isError: statsError } = useMyStats()

  /** 개수 영역은 로그인 + 조회 성공일 때만 노출 (실패해도 카드 나머지는 그대로) */
  const showStats = Boolean(user) && !statsError

  const hotPosts = (data?.pages[0]?.content ?? []).slice(0, HOT_POST_COUNT)

  return (
    <aside className="flex flex-col gap-5">
      {/* Profile card */}
      <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden">
        <div
          className="h-[58px] relative"
          style={{ background: 'linear-gradient(135deg, #1E4A38 0%, #2E7D6B 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
              backgroundSize: '20px 20px',
            }}
          />
          <div
            onClick={() => navigate('/mypage')}
            className="absolute left-5 -bottom-6 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base border-[3px] border-white shadow-md z-10 cursor-pointer"
            style={{ background: '#2E7D6B' }}
          >
            {user?.avatarInitial ?? user?.nickname?.slice(0, 1) ?? '?'}
          </div>
        </div>
        <div className="px-5 pb-5 pt-8">
          <p
            onClick={() => navigate('/mypage')}
            className="text-sm font-bold text-[#1A1A1A] cursor-pointer hover:text-[#2E7D6B] transition-colors"
          >
            {user?.nickname ?? '로그인이 필요해요'}
          </p>
          {showStats && (
            /* 숫자 위 · 라벨 아래 2분할 (book 사이드바 ProfileCard 와 동일 관례) */
            <div className="grid grid-cols-2 divide-x divide-[#F0F0F0] mt-4 pt-3 border-t border-[#F0F0F0]">
              {/* 로딩 중엔 숫자 자리만 비운다 (인기글 카드처럼 스켈레톤 없이 텍스트로 처리) */}
              <button onClick={() => navigate('/community/my-posts')} className="text-center group py-1">
                <p className="text-xl font-bold leading-none" style={{ color: '#1E4A38' }}>
                  {stats?.postCount ?? ' '}
                </p>
                <p className="text-xs text-[#aaa] mt-1 group-hover:text-[#2E7D6B] transition-colors">
                  내가 쓴 글
                </p>
              </button>
              <button onClick={() => navigate('/community/my-scraps')} className="text-center group py-1">
                <p className="text-xl font-bold leading-none" style={{ color: '#1E4A38' }}>
                  {stats?.scrapCount ?? ' '}
                </p>
                <p className="text-xs text-[#aaa] mt-1 group-hover:text-[#2E7D6B] transition-colors">
                  스크랩한 글
                </p>
              </button>
            </div>
          )}
        </div>
      </div>

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
