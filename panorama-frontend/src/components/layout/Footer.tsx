import { BookOpen } from 'lucide-react'

/** 사이트 공통 푸터 */
export default function Footer() {
  return (
    <footer className="border-t border-[#EAEAEA] bg-white mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-brand" />
          <span className="text-brand font-bold text-[15px]">파노라마북스</span>
        </div>
        <p className="text-[12px] text-[#999]">
          © 2026 파노라마북스 · 도서 검색 + 독서 커뮤니티
        </p>
      </div>
    </footer>
  )
}
