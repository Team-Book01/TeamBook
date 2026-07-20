import { Link, useNavigate } from 'react-router-dom'
import { Flame, TrendingUp } from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { usePopularPosts } from '@/api/community'

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
            className="absolute left-5 -bottom-6 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base border-[3px] border-white shadow-md z-10"
            style={{ background: '#2E7D6B' }}
          >
            {user?.avatarInitial ?? user?.nickname?.slice(0, 1) ?? '?'}
          </div>
        </div>
        <div className="px-5 pb-5 pt-8">
          <p className="text-sm font-bold text-[#1A1A1A]">{user?.nickname ?? '로그인이 필요해요'}</p>
          <Link
            to="/mypage"
            className="inline-block text-xs text-[#bbb] mt-1 hover:text-[#2E7D6B] transition-colors"
          >
            마이페이지에서 내 활동 보기 →
          </Link>
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
