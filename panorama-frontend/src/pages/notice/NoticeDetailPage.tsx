import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pin, Eye, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotice, NOTICE_CATEGORY_LABEL, NOTICE_CATEGORY_BADGE } from '@/api/notice'
import { getErrorMessage, getErrorStatus } from '@/api/client'
import { sanitizePostHtml } from '@/pages/community/utils'

const formatDateTime = (iso: string) => iso.replace('T', ' ').slice(0, 16)

export default function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const noticeId = id ? Number(id) : NaN
  const { data, isLoading, isError, error } = useNotice(Number.isInteger(noticeId) ? noticeId : null)

  return (
    <main className="max-w-[760px] mx-auto px-6 py-10">
      <button
        onClick={() => navigate('/notices')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5 cursor-pointer"
      >
        <ArrowLeft size={15} /> 목록으로
      </button>

      {isLoading ? (
        <div className="py-24 text-center text-sm text-muted-foreground">불러오는 중…</div>
      ) : isError || !data ? (
        <div className="py-24 text-center">
          <AlertCircle size={22} className="mx-auto mb-2 text-red-400" />
          <p className="text-sm text-red-600">
            {getErrorStatus(error) === 404
              ? '존재하지 않거나 게시가 종료된 공지입니다.'
              : getErrorMessage(error, '공지를 불러오지 못했습니다.')}
          </p>
        </div>
      ) : (
        <article>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-semibold', NOTICE_CATEGORY_BADGE[data.category])}>
              {NOTICE_CATEGORY_LABEL[data.category]}
            </span>
            {data.pinned && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                <Pin size={11} className="fill-amber-700" /> 상단 고정
              </span>
            )}
            {data.important && <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">중요</span>}
          </div>

          <h1 className="text-xl font-bold text-foreground leading-snug mb-3">{data.title}</h1>

          <div className="flex items-center gap-3 text-xs text-muted-foreground pb-5 mb-6 border-b border-border">
            <span>{data.nickname}</span>
            <span>·</span>
            <span>{formatDateTime(data.createdAt)}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1"><Eye size={12} /> {data.viewCount.toLocaleString()}</span>
          </div>

          {/* 관리자가 작성한 에디터 HTML. 계정 탈취 시 모든 사용자가 보는 화면이라
              게시글·공지 관리와 같은 sanitize 를 거친다. */}
          <div
            className="text-[15px] leading-[1.85] text-[#2C2C2C] break-words
              [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-2 [&_p]:my-1.5"
            dangerouslySetInnerHTML={{ __html: sanitizePostHtml(data.content) }}
          />
        </article>
      )}
    </main>
  )
}
