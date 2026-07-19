import type { ReactNode } from 'react'
import CommunitySidebar from './CommunitySidebar'

/**
 * 커뮤니티 공통 레이아웃 (목록/상세 페이지가 동일한 컨테이너 폭·그리드 비율을 공유).
 * 기준은 목록 페이지: max-w 1440px / 본문 1fr + 사이드바 308px / gap 28px.
 */
export default function CommunityLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{ background: '#F9F9F9', fontFamily: "'Noto Sans KR', sans-serif" }}
    >
      <div className="max-w-[1440px] mx-auto px-10 py-8">
        <div className="grid gap-7 items-start" style={{ gridTemplateColumns: '1fr 308px' }}>
          <section className="min-w-0">{children}</section>
          <CommunitySidebar />
        </div>
      </div>
    </div>
  )
}
