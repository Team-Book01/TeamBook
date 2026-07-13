import { Construction } from 'lucide-react'

interface PagePlaceholderProps {
  title: string
  description?: string
}

/**
 * 아직 담당자가 디자인을 주지 않은 페이지용 "준비 중" placeholder.
 * (로그인·회원가입·마이페이지·계정설정 등)
 */
export default function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-24 flex flex-col items-center justify-center text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-[#EFF6F2] flex items-center justify-center">
        <Construction size={30} className="text-brand" />
      </div>
      <h1 className="text-[22px] font-bold text-[#1A1A1A]">{title}</h1>
      <p className="text-[14px] text-[#888]">{description ?? '준비 중입니다.'}</p>
    </div>
  )
}
