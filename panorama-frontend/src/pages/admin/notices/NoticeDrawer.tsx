import { useState, useEffect } from 'react'
import { X, Pin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NoticeCategory, NoticeDetailResponse } from '@/types/admin'
import { NOTICE_CATEGORY_BADGE, NOTICE_CATEGORY_OPTIONS, NOTICE_STATUS_META, formatDate } from './noticeMeta'

export interface NoticeForm {
  category: NoticeCategory
  title: string
  content: string
  pinned: boolean
  important: boolean
}

interface Props {
  mode: 'view' | 'edit' | 'create'
  detail: NoticeDetailResponse | null
  loading?: boolean
  submitting?: boolean
  submitError?: string | null
  onClose: () => void
  onEdit: () => void
  onSubmit: (form: NoticeForm) => void
}

export default function NoticeDrawer({ mode, detail, loading, submitting, submitError, onClose, onEdit, onSubmit }: Props) {
  const [form, setForm] = useState<NoticeForm>({
    category: 'GENERAL',
    title: '',
    content: '',
    pinned: false,
    important: false,
  })

  useEffect(() => {
    if (mode !== 'create' && detail) {
      setForm({
        category: detail.category,
        title: detail.title,
        content: detail.content,
        pinned: detail.pinned,
        important: detail.important,
      })
    } else if (mode === 'create') {
      setForm({ category: 'GENERAL', title: '', content: '', pinned: false, important: false })
    }
  }, [mode, detail])

  const isView = mode === 'view'

  return (
    <>
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
      {/* Dim */}
      <div onClick={onClose} className="fixed inset-0 bg-black/35 backdrop-blur-[1px] z-40" />
      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-[40%] min-w-[380px] bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.12)] z-50 flex flex-col animate-[slideInRight_0.22s_ease-out]">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border flex items-center gap-2.5 shrink-0">
          <span className={cn('text-xs font-semibold px-2.5 py-[3px] rounded-full', NOTICE_CATEGORY_BADGE[form.category])}>
            {NOTICE_CATEGORY_OPTIONS.find(o => o.value === form.category)?.label}
          </span>
          {isView && detail && (
            <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', NOTICE_STATUS_META[detail.status].text)}>
              <span className={cn('w-[7px] h-[7px] rounded-full inline-block', NOTICE_STATUS_META[detail.status].dot)} />
              {NOTICE_STATUS_META[detail.status].label}
            </span>
          )}
          <div className="flex-1" />
          <span className="text-muted-foreground text-[13px]">
            {mode === 'create' ? '새 공지 작성' : mode === 'edit' ? '공지 수정' : '공지 상세'}
          </span>
          <button onClick={onClose} className="text-muted-foreground p-1 rounded-md hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isView ? (
            loading || !detail ? (
              <div className="py-20 text-center text-sm text-muted-foreground">불러오는 중…</div>
            ) : (
              <ViewContent detail={detail} />
            )
          ) : (
            <EditForm form={form} setForm={setForm} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border shrink-0">
          {isView ? (
            <button
              onClick={onEdit}
              disabled={!detail}
              className="w-full py-2.5 bg-admin text-white rounded-lg font-semibold text-sm hover:bg-admin-hover transition-colors disabled:opacity-50"
            >
              수정
            </button>
          ) : (
            <>
              <button
                onClick={() => onSubmit(form)}
                disabled={submitting || !form.title.trim()}
                className="w-full py-2.5 bg-admin text-white rounded-lg font-bold text-sm hover:bg-admin-hover transition-colors disabled:opacity-50"
              >
                {submitting ? '저장 중…' : mode === 'edit' ? '변경사항 저장' : '공지 등록'}
              </button>
              {submitError && <p className="mt-2 text-[11px] text-red-600 text-center">{submitError}</p>}
            </>
          )}
        </div>
      </div>
    </>
  )
}

function ViewContent({ detail }: { detail: NoticeDetailResponse }) {
  return (
    <div>
      <div className="flex gap-2 mb-3 flex-wrap">
        {detail.pinned && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
            <Pin size={11} className="fill-amber-700" /> 상단 고정
          </span>
        )}
        {detail.important && <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded">중요</span>}
      </div>
      <h2 className="text-lg font-bold text-foreground mb-4 leading-snug">{detail.title}</h2>
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        {[
          { label: '조회수', value: detail.viewCount.toLocaleString() + '회' },
          { label: '작성자', value: detail.nickname },
          { label: '게시일', value: formatDate(detail.createdAt) },
          { label: '상태', value: NOTICE_STATUS_META[detail.status].label },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-lg px-3 py-2.5">
            <div className="text-muted-foreground text-[11px] mb-0.5">{label}</div>
            <div className="text-foreground text-[13px] font-semibold">{value}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-4">
        <div className="text-[#374151] text-sm leading-[1.8] whitespace-pre-wrap">{detail.content}</div>
      </div>
    </div>
  )
}

function EditForm({ form, setForm }: { form: NoticeForm; setForm: (f: NoticeForm) => void }) {
  const fieldCls =
    'w-full px-3 py-2.5 rounded-lg border-[1.5px] border-border text-sm text-foreground bg-white outline-none focus:border-admin'
  const labelCls = 'block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-[0.03em]'

  return (
    <div className="flex flex-col gap-[18px]">
      <div>
        <label className={labelCls}>분류</label>
        <select
          className={cn(fieldCls, 'cursor-pointer')}
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value as NoticeCategory })}
        >
          {NOTICE_CATEGORY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls}>제목</label>
        <input
          className={fieldCls}
          placeholder="공지 제목을 입력하세요"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div>
        <label className={labelCls}>본문</label>
        <textarea
          className="w-full min-h-[200px] px-3 py-2.5 rounded-lg border-[1.5px] border-border text-sm text-foreground bg-white resize-y outline-none focus:border-admin leading-[1.7]"
          placeholder="공지 내용을 입력하세요..."
          value={form.content}
          onChange={e => setForm({ ...form, content: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-3">
        <label className={labelCls}>옵션</label>
        {[
          { key: 'pinned' as const, label: '상단 고정', desc: '목록 최상단에 고정됩니다' },
          { key: 'important' as const, label: '중요 공지', desc: '제목에 빨강 "중요" 배지가 표시됩니다' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between px-3.5 py-2.5 bg-gray-50 rounded-lg">
            <div>
              <div className="text-[13px] font-semibold text-foreground">{label}</div>
              <div className="text-[11px] text-muted-foreground">{desc}</div>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, [key]: !form[key] })}
              className={cn(
                'w-[42px] h-6 rounded-full relative transition-colors shrink-0',
                form[key] ? 'bg-admin' : 'bg-gray-300',
              )}
            >
              <span
                className={cn(
                  'absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all',
                  form[key] ? 'left-5' : 'left-[3px]',
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
