import { useState, useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type Editor from '@toast-ui/editor'
import { X, Pin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getErrorMessage } from '@/api/client'
import { uploadNoticeImages } from '@/api/admin'
import { toApiImageUrl } from '@/api/community'
import { sanitizePostHtml } from '@/pages/community/utils'
import ToastEditor from '@/pages/community/components/ToastEditor'
import type { NoticeCategory, NoticeDetailResponse } from '@/types/admin'
import { NOTICE_CATEGORY_BADGE, NOTICE_CATEGORY_OPTIONS, NOTICE_STATUS_META, formatDate } from './noticeMeta'
import AdminSelect from '@/components/admin/AdminSelect'

export interface NoticeForm {
  category: NoticeCategory
  title: string
  content: string
  pinned: boolean
  important: boolean
  /** 이 편집 세션에서 업로드한 이미지 키. 저장 시 서버가 소유자를 연결한다. */
  imageKeys: string[]
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
    imageKeys: [],
  })

  useEffect(() => {
    // 편집 대상이 바뀌면 이전 세션에서 모은 키를 버린다 — 다른 공지에 붙이려 하면 409 가 난다.
    imageKeysRef.current = []
    if (mode !== 'create' && detail) {
      setForm({
        category: detail.category,
        title: detail.title,
        content: detail.content,
        pinned: detail.pinned,
        important: detail.important,
        imageKeys: [],   // 기존 이미지는 이미 연결돼 있다. 이번에 새로 올린 것만 모은다.
      })
    } else if (mode === 'create') {
      setForm({ category: 'GENERAL', title: '', content: '', pinned: false, important: false, imageKeys: [] })
    }
  }, [mode, detail])

  const isView = mode === 'view'
  const editorRef = useRef<Editor>(null)
  // 업로드 훅은 에디터 마운트 시 클로저가 고정되어 setForm 을 쓰면 오래된 form 을 본다.
  // 키는 ref 에 모으고 저장 시점에 한 번에 읽는다.
  const imageKeysRef = useRef<string[]>([])

  // 본문은 에디터가 들고 있으므로 저장 시점에 꺼내 온다. 에디터가 아직 없으면(뷰 모드 등)
  // form 값을 그대로 쓴다.
  const handleSubmit = () =>
    onSubmit({
      ...form,
      content: editorRef.current?.getHTML() ?? form.content,
      imageKeys: imageKeysRef.current,
    })

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
            // 에디터는 마운트 시 initialHtml 을 한 번만 읽는다. 상세를 불러오기 전에 마운트되면
            // 빈 본문으로 굳으므로, 대상이 바뀔 때 key 로 리마운트시킨다.
            <EditForm
              key={`${mode}-${detail?.noticeId ?? 'new'}`}
              form={form}
              setForm={setForm}
              editorRef={editorRef}
              onImageUploaded={key => imageKeysRef.current.push(key)}
            />
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
                onClick={handleSubmit}
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
        {/* 에디터가 만든 HTML. 관리자가 쓴 글이지만 계정 탈취 시 모든 사용자가 보는 화면이라
            게시글과 같은 sanitize 를 거친다. */}
        <div
          className="text-[#374151] text-sm leading-[1.8] break-words
            [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-2 [&_p]:my-1"
          dangerouslySetInnerHTML={{ __html: sanitizePostHtml(detail.content) }}
        />
      </div>
    </div>
  )
}

function EditForm({ form, setForm, editorRef, onImageUploaded }: {
  form: NoticeForm; setForm: (f: NoticeForm) => void; editorRef: RefObject<Editor | null>
  onImageUploaded: (imageKey: string) => void
}) {
  const fieldCls =
    'w-full px-3 py-2.5 rounded-lg border-[1.5px] border-border text-sm text-foreground bg-white outline-none focus:border-admin'
  const labelCls = 'block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-[0.03em]'

  return (
    <div className="flex flex-col gap-[18px]">
      {/* 셀렉트 래퍼가 shrink-0 이라 폭이 좁아지지 않도록 이 칸을 기준으로 늘린다. */}
      <div className="[&>div]:w-full">
        <label className={labelCls}>분류</label>
        {/* 필터 바가 아니라 입력 폼이라 기본 스타일 대신 이 폼의 fieldCls 를 쓴다.
            화살표만 공용 컴포넌트에서 가져온다. */}
        <AdminSelect
          baseClassName={cn(fieldCls, 'appearance-none pr-8 cursor-pointer')}
          className="block"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value as NoticeCategory })}
        >
          {NOTICE_CATEGORY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </AdminSelect>
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
        {/* 게시글과 같은 에디터. 본문은 여기서 state 로 동기화하지 않고 저장 시 getHTML() 로 읽는다
            (Toast UI 는 비제어 컴포넌트라 매 입력마다 state 를 갱신하면 IME 조합이 깨진다). */}
        <ToastEditor
          editorRef={editorRef}
          initialHtml={form.content}
          placeholder="공지 내용을 입력하세요"
          height="360px"
          onImageUpload={async (blob, callback) => {
            try {
              const [image] = await uploadNoticeImages([blob as File])
              onImageUploaded(image.imageKey)   // 저장 시 공지에 연결할 키
              callback(toApiImageUrl(image.imageUrl), 'image')
            } catch (e) {
              alert(getErrorMessage(e, '이미지 업로드에 실패했습니다.'))
            }
          }}
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
