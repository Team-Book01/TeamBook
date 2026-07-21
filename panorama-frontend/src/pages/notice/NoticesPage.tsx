import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Megaphone, Pin, AlertCircle, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotices, NOTICE_CATEGORIES, NOTICE_CATEGORY_LABEL, NOTICE_CATEGORY_BADGE } from '@/api/notice'
import { getErrorMessage } from '@/api/client'
import type { NoticeCategory } from '@/types/notice'

const formatDate = (iso: string) => iso.slice(0, 10)

export default function NoticesPage() {
  const navigate = useNavigate()
  const [category, setCategory] = useState<'전체' | NoticeCategory>('전체')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, error, refetch } = useNotices({
    category: category === '전체' ? undefined : category,
    page,
    size: 15,
  })
  const notices = data?.content ?? []

  const changeCategory = (c: '전체' | NoticeCategory) => {
    setCategory(c)
    setPage(1)
  }

  return (
    <main className="max-w-[840px] mx-auto px-6 py-10">
      <div className="flex items-center gap-2 mb-1">
        <Megaphone size={22} className="text-primary" />
        <h1 className="text-xl font-bold text-foreground">공지사항</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">파노라마북스의 새로운 소식을 확인하세요.</p>

      {/* 분류 탭 */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {(['전체', ...NOTICE_CATEGORIES] as const).map(c => (
          <button
            key={c}
            onClick={() => changeCategory(c)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-colors',
              category === c ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
            )}
          >
            {c === '전체' ? '전체' : NOTICE_CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-sm text-muted-foreground">불러오는 중…</div>
        ) : isError ? (
          <div className="py-20 text-center">
            <AlertCircle size={22} className="mx-auto mb-2 text-red-400" />
            <p className="text-sm text-red-600 mb-3">{getErrorMessage(error, '공지 목록을 불러오지 못했습니다.')}</p>
            <button onClick={() => refetch()} className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-gray-50">다시 시도</button>
          </div>
        ) : notices.length === 0 ? (
          <div className="py-20 text-center">
            <Inbox size={22} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-muted-foreground">등록된 공지가 없습니다.</p>
          </div>
        ) : (
          <ul>
            {notices.map(n => (
              <li key={n.noticeId} className="border-b border-gray-100 last:border-0">
                <button
                  onClick={() => navigate(`/notices/${n.noticeId}`)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className={cn('shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold', NOTICE_CATEGORY_BADGE[n.category])}>
                    {NOTICE_CATEGORY_LABEL[n.category]}
                  </span>
                  <span className="flex-1 min-w-0 flex items-center gap-1.5">
                    {n.pinned && <Pin size={12} className="shrink-0 text-primary fill-primary" />}
                    {n.important && <span className="shrink-0 text-[11px] font-bold text-red-600">[중요]</span>}
                    <span className="truncate text-sm font-medium text-foreground">{n.title}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(n.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-gray-50 disabled:opacity-40">이전</button>
          <span className="text-xs text-muted-foreground">{page} / {data.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-gray-50 disabled:opacity-40">다음</button>
        </div>
      )}
    </main>
  )
}
