import { useState, useEffect } from 'react'
import { X, Pin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Notice } from './noticeData'

interface Props {
  notice: Notice | null
  mode: 'view' | 'edit' | 'create'
  onClose: () => void
  onSave: (data: Partial<Notice>) => void
  onDelete?: (id: string) => void
}

const CATEGORIES = ['일반', '이벤트', '업데이트', '점검']
const STATUSES = ['ACTIVE', 'HIDDEN']

// 카테고리 배지 — 구분용 팔레트라 의미색으로 유지
const CAT_BADGE: Record<string, string> = {
  일반: 'bg-gray-100 text-gray-500',
  이벤트: 'bg-violet-100 text-violet-700',
  업데이트: 'bg-blue-100 text-blue-700',
  점검: 'bg-orange-100 text-orange-700',
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  HIDDEN: 'bg-gray-100 text-gray-500',
  DELETED: 'bg-red-100 text-red-600',
}

export default function NoticeDrawer({ notice, mode: initialMode, onClose, onSave, onDelete }: Props) {
  const [mode, setMode] = useState(initialMode)
  const [form, setForm] = useState({
    title: '',
    category: '일반',
    content: '',
    pinned: false,
    important: false,
    status: 'ACTIVE' as 'ACTIVE' | 'HIDDEN',
  })

  useEffect(() => {
    setMode(initialMode)
    if (notice && initialMode !== 'create') {
      setForm({
        title: notice.title,
        category: notice.category,
        content: notice.content,
        pinned: notice.pinned,
        important: notice.important,
        status: notice.status as 'ACTIVE' | 'HIDDEN',
      })
    } else if (initialMode === 'create') {
      setForm({ title: '', category: '일반', content: '', pinned: false, important: false, status: 'ACTIVE' })
    }
  }, [notice, initialMode])

  return (
    <>
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
      {/* Dim */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/35 backdrop-blur-[1px] z-40"
      />
      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-[40%] bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.12)] z-50 flex flex-col animate-[slideInRight_0.22s_ease-out]">
        {/* Drawer header */}
        <div className="px-6 pt-5 pb-4 border-b border-border flex items-center gap-2.5 shrink-0">
          <span className={cn('text-xs font-semibold px-2.5 py-[3px] rounded-full', CAT_BADGE[form.category] || CAT_BADGE['일반'])}>
            {form.category}
          </span>
          {mode === 'view' && notice && (
            <span className={cn('text-xs font-semibold px-2.5 py-[3px] rounded-full', STATUS_BADGE[notice.status] || STATUS_BADGE['HIDDEN'])}>
              {notice.status}
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
          {mode === 'view' && notice ? (
            <ViewContent notice={notice} />
          ) : (
            <EditForm form={form} setForm={setForm} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border shrink-0">
          {mode === 'view' ? (
            <div className="flex gap-2">
              <button
                onClick={() => setMode('edit')}
                className="flex-1 py-2.5 bg-admin text-white rounded-lg font-semibold text-sm hover:bg-admin-hover transition-colors"
              >
                수정
              </button>
              {onDelete && notice && (
                <button
                  onClick={() => { onDelete(notice.id); onClose() }}
                  className="px-[18px] py-2.5 bg-white text-red-500 border-[1.5px] border-red-500 rounded-lg font-semibold text-sm hover:bg-red-50 transition-colors"
                >
                  삭제
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => onSave({ ...form, draft: true } as Partial<Notice>)}
                  className="flex-1 py-2.5 bg-white text-muted-foreground border-[1.5px] border-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  임시저장
                </button>
                {mode === 'edit' && onDelete && notice && (
                  <button
                    onClick={() => { onDelete(notice.id); onClose() }}
                    className="px-[18px] py-2.5 bg-white text-red-500 border-[1.5px] border-red-500 rounded-lg font-semibold text-sm hover:bg-red-50 transition-colors"
                  >
                    삭제
                  </button>
                )}
              </div>
              <button
                onClick={() => { onSave(form as Partial<Notice>); onClose() }}
                className="w-full py-2.5 bg-admin text-white rounded-lg font-bold text-sm hover:bg-admin-hover transition-colors"
              >
                {mode === 'edit' ? '변경사항 저장' : '공지 등록'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function ViewContent({ notice }: { notice: Notice }) {
  return (
    <div>
      <div className="flex gap-2 mb-3 flex-wrap">
        {notice.pinned && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
            <Pin size={11} className="fill-amber-700" /> 상단 고정
          </span>
        )}
        {notice.important && <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded">중요</span>}
      </div>
      <h2 className="text-lg font-bold text-foreground mb-4 leading-snug">{notice.title}</h2>
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        {[
          { label: '조회수', value: notice.views.toLocaleString() + '회' },
          { label: '작성자', value: notice.author },
          { label: '게시일', value: notice.date },
          { label: '상태', value: notice.status },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-lg px-3 py-2.5">
            <div className="text-muted-foreground text-[11px] mb-0.5">{label}</div>
            <div className="text-foreground text-[13px] font-semibold">{value}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-4">
        <div className="text-[#374151] text-sm leading-[1.8] whitespace-pre-wrap">{notice.content}</div>
      </div>
    </div>
  )
}

interface FormState {
  title: string
  category: string
  content: string
  pinned: boolean
  important: boolean
  status: 'ACTIVE' | 'HIDDEN'
}

function EditForm({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  const fieldCls =
    'w-full px-3 py-2.5 rounded-lg border-[1.5px] border-border text-sm text-foreground bg-white outline-none focus:border-admin'
  const labelCls = 'block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-[0.03em]'

  return (
    <div className="flex flex-col gap-[18px]">
      <div>
        <label className={labelCls}>분류</label>
        <select className={cn(fieldCls, 'cursor-pointer')} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
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
        <div className="border-[1.5px] border-border rounded-lg overflow-hidden">
          <div className="bg-gray-50 border-b border-border px-2.5 py-1.5 flex gap-2">
            {['B', 'I', 'U', '≡', '·'].map(t => (
              <button
                key={t}
                className={cn(
                  'border border-gray-300 rounded w-[26px] h-[26px] text-xs text-muted-foreground hover:bg-gray-100 transition-colors',
                  t === 'B' ? 'font-bold' : 'font-normal',
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <textarea
            className="w-full min-h-[180px] p-3 text-sm text-foreground border-none resize-y outline-none leading-[1.7]"
            placeholder="공지 내용을 입력하세요..."
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
          />
        </div>
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
      <div>
        <label className={labelCls}>상태</label>
        <select className={cn(fieldCls, 'cursor-pointer')} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'ACTIVE' | 'HIDDEN' })}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
    </div>
  )
}
