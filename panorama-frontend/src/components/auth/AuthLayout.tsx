import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import authBooks from '@/assets/auth-books.jpg'

/** 로그인·회원가입 공통 2단 레이아웃 (좌: 비주얼, 우: 폼). */
export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* 비주얼 영역 */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={authBooks}
          alt="따뜻한 조명 아래 쌓여 있는 책들"
          width={1024}
          height={1536}
          className="absolute inset-0 size-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(160deg, oklch(0.45 0.07 158 / 0.28), oklch(0.32 0.055 165 / 0.72))',
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-3 text-white">
            <BookOpen className="size-10 sm:size-12" />
            <span className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              파노라마북스
            </span>
          </Link>
          <div className="max-w-md">
            <p className="font-display text-4xl leading-tight font-medium">
              읽고, 기록하고, 함께 나누는 독서의 공간.
            </p>
            <p className="mt-4 text-sm text-white/85">
              도서를 검색해 북마크하고, 평가·리뷰·독후감을 남기고, 독서 인증과 가까운 공공도서관까지
              한곳에서.
            </p>
          </div>
        </div>
      </div>

      {/* 폼 영역 */}
      <div className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 flex items-center gap-2 lg:hidden">
            <BookOpen size={22} className="text-brand" />
            <span className="text-brand text-xl font-bold tracking-tight">파노라마북스</span>
          </Link>
          <p className="text-sm font-semibold tracking-wide text-accent-foreground/70 uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
