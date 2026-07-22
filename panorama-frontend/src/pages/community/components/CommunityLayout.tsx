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
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* 좁은 화면: 한 컬럼(사이드바가 본문 아래로). lg+: 본문 1fr + 사이드바 폭을 유동적으로
            (240~308px, 화면에 따라 부드럽게). 카드 글씨도 이 폭에 맞춰 컨테이너쿼리로 스케일된다. */}
        <div className="grid gap-7 items-start grid-cols-1 lg:grid-cols-[1fr_clamp(240px,22vw,308px)]">
          <section className="min-w-0">{children}</section>
          <CommunitySidebar />
        </div>
      </div>
    </div>
  )
}
