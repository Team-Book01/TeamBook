import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Send, Trash2, Image as ImageIcon, AlertCircle, Inbox, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage } from '@/api/client'
import { useAdminInquiries, useAdminInquiry, useAnswerInquiry, useUpdateInquiryStatus } from '@/api/admin'
import DetailDrawer from '@/components/admin/DetailDrawer'
import type { InquirySearchRequest, InquiryStatus } from '@/types/admin'

const STATUS_META: Record<InquiryStatus, { label: string; bg: string; text: string }> = {
  PENDING: { label: '답변 대기', bg: 'bg-amber-50', text: 'text-amber-600' },
  ANSWERED: { label: '답변 완료', bg: 'bg-green-50', text: 'text-green-700' },
  CLOSED: { label: '종료', bg: 'bg-gray-100', text: 'text-gray-500' },
  DELETED: { label: '삭제됨', bg: 'bg-red-50', text: 'text-red-600' },
}
const CATEGORY_LABEL: Record<string, string> = {
  ACCOUNT: '계정·로그인', BOOK: '도서·도서관', CONTENT: '게시판·콘텐츠', SERVICE: '서비스',
  REPORT: '신고·제재', PAYMENT: '결제', BUG: '버그·오류', ETC: '기타',
}
const catLabel = (c: string) => CATEGORY_LABEL[c] ?? c
const fmt = (iso?: string | null) => (iso ? iso.replace('T', ' ').slice(0, 16) : '-')

function StatBadge({ status }: { status: InquiryStatus }) {
  const s = STATUS_META[status]
  return <span className={cn('inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap', s.bg, s.text)}>{s.label}</span>
}

// ── Detail drawer (공용 DetailDrawer) ──────────────────────────────────────────
function InquiryDetailDrawer({ inquiryId, onClose }: { inquiryId: number; onClose: () => void }) {
  const me = useAuthStore(s => s.user)
  const { data, isLoading, isError, error, refetch } = useAdminInquiry(inquiryId)
  const answerMut = useAnswerInquiry()
  const statusMut = useUpdateInquiryStatus()
  const [answerText, setAnswerText] = useState('')

  const inquiry = data?.inquiry
  const answers = data?.answers ?? []
  const isDeleted = inquiry?.status === 'DELETED'

  const submitAnswer = () => {
    if (!answerText.trim()) return
    answerMut.mutate({ inquiryId, body: { userId: me?.id ?? 0, content: answerText } }, { onSuccess: () => setAnswerText('') })
  }

  const header = inquiry ? (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">{catLabel(inquiry.category)}</span>
      <StatBadge status={inquiry.status} />
    </div>
  ) : (
    <span className="text-sm font-bold text-foreground">문의 상세</span>
  )

  return (
    <DetailDrawer onClose={onClose} header={header} width={480}>
      {isLoading ? (
        <div className="p-10 text-center text-sm text-muted-foreground">불러오는 중…</div>
      ) : isError || !inquiry ? (
        <div className="p-8 text-center">
          <AlertCircle size={20} className="mx-auto mb-2 text-red-400" />
          <p className="text-sm text-red-600 mb-3">{getErrorMessage(error, '문의 상세를 불러오지 못했습니다.')}</p>
          <button onClick={() => refetch()} className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-gray-50">다시 시도</button>
        </div>
      ) : (
        <div className="px-5 py-5 space-y-5">
          {/* 제목 + 삭제 */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h2 className="text-[15px] font-bold text-foreground leading-snug">{inquiry.title}</h2>
              {!isDeleted && (
                <button onClick={() => statusMut.mutate({ inquiryId, body: { status: 'DELETED' } })}
                  className="shrink-0 text-[11px] text-red-500 border border-red-200 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1">
                  <Trash2 className="w-3 h-3" />삭제
                </button>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground">{fmt(inquiry.createdAt)} 접수</span>
          </div>

          {isDeleted && (
            <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
              <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" /><p className="text-[12px] text-muted-foreground">삭제된 문의 · 열람만 가능합니다.</p>
            </div>
          )}

          <section>
            <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">문의 내용</p>
            <div className="bg-gray-50 rounded-xl p-4"><p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">{inquiry.content}</p></div>
          </section>

          {inquiry.images.length > 0 && (
            <section>
              <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">첨부 이미지 ({inquiry.images.length})</p>
              <div className="flex gap-2 flex-wrap">
                {inquiry.images.map(img => (
                  <div key={img.inquiryImageId} title={img.originalFileName} className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-300" />
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="border-t border-dashed border-gray-200" />

          <section>
            <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">답변 ({answers.length})</p>
            <div className="space-y-3">
              {answers.map(a => (
                <div key={a.inquiryAnswerId} className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-2.5 bg-white flex items-center gap-2" style={{ borderLeft: '3px solid #1e4a38' }}>
                    <span className="text-[12px] font-semibold text-foreground">관리자</span>
                    <span className="text-[11px] text-muted-foreground">{fmt(a.createdAt)}</span>
                  </div>
                  <div className="px-4 py-3.5 bg-gray-50/60"><p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">{a.content}</p></div>
                </div>
              ))}
              {answers.length === 0 && !isDeleted && <p className="text-[12px] text-muted-foreground">아직 등록된 답변이 없습니다.</p>}
            </div>

            {!isDeleted && (
              <div className="mt-3">
                <textarea value={answerText} onChange={e => setAnswerText(e.target.value)} placeholder="답변을 입력하세요" rows={5}
                  className="w-full text-[13px] border border-border rounded-xl p-3.5 outline-none focus:border-admin resize-none leading-relaxed" />
                <div className="flex items-center justify-end mt-2.5">
                  <button onClick={submitAnswer} disabled={answerMut.isPending || !answerText.trim()}
                    className="text-[12px] text-white px-4 py-1.5 rounded-lg bg-admin hover:bg-admin-hover transition-colors flex items-center gap-1.5 font-semibold disabled:opacity-50">
                    <Send className="w-3 h-3" />{answerMut.isPending ? '등록 중…' : '답변 등록'}
                  </button>
                </div>
                {(answerMut.isError || statusMut.isError) && (
                  <p className="text-[11px] text-red-600 text-right mt-1.5">{getErrorMessage(answerMut.error ?? statusMut.error, '처리에 실패했습니다. 다시 시도해 주세요.')}</p>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </DetailDrawer>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AdminInquiriesPage() {
  const [searchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState('')
  const [fStatus, setFStatus] = useState<'전체' | InquiryStatus>('전체')
  const [params, setParams] = useState<InquirySearchRequest>({ page: 1, size: 20 })
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // 대시보드에서 ?open=<id> 로 진입 시 해당 문의 상세 자동 오픈 (숫자만 허용)
  useEffect(() => {
    const open = searchParams.get('open')
    const id = open ? Number(open) : NaN
    if (Number.isInteger(id) && id > 0) setSelectedId(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { data, isLoading, isError, error, refetch, isFetching } = useAdminInquiries(params)
  const items = data?.content ?? []
  const page = params.page ?? 1
  const totalPages = data?.totalPages ?? 1

  const apply = () => setParams({ searchString: searchInput.trim() || undefined, status: fStatus === '전체' ? undefined : fStatus, page: 1, size: 20 })

  return (
    <div className="p-6">
      <div className="space-y-5">
        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-border px-5 py-4 shadow-sm flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && apply()}
              placeholder="제목 / 내용 검색"
              className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-border bg-gray-50 text-foreground outline-none focus:border-admin" />
          </div>
          <select value={fStatus} onChange={e => setFStatus(e.target.value as typeof fStatus)}
            className="appearance-none pl-3 pr-7 py-2 text-sm rounded-xl border border-border bg-gray-50 text-foreground outline-none cursor-pointer focus:border-admin">
            <option value="전체">상태 전체</option><option value="PENDING">답변 대기</option><option value="ANSWERED">답변 완료</option><option value="CLOSED">종료</option><option value="DELETED">삭제됨</option>
          </select>
          <button onClick={apply} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-admin hover:bg-admin-hover transition-colors">
            <Search size={13} />검색
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">문의 목록</span>
            <span className="text-xs text-muted-foreground">총 {data?.totalElements ?? 0}건</span>
            {isFetching && <span className="text-xs text-muted-foreground">· 갱신 중…</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  {['분류', '제목', '상태', '접수일'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-left whitespace-nowrap text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="px-4 py-16 text-center text-sm text-muted-foreground">불러오는 중…</td></tr>
                ) : isError ? (
                  <tr><td colSpan={4} className="px-4 py-16 text-center">
                    <AlertCircle size={22} className="mx-auto mb-2 text-red-400" />
                    <p className="text-sm text-red-600 mb-3">{getErrorMessage(error, '문의 목록을 불러오지 못했습니다.')}</p>
                    <button onClick={() => refetch()} className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-gray-50">다시 시도</button>
                  </td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-16 text-center"><Inbox size={22} className="mx-auto mb-2 text-gray-300" /><p className="text-sm text-muted-foreground">조건에 맞는 문의가 없습니다.</p></td></tr>
                ) : (
                  items.map(inq => (
                    <tr key={inq.inquiryId} onClick={() => setSelectedId(inq.inquiryId)}
                      className={cn('border-b border-gray-100 cursor-pointer transition-colors', selectedId === inq.inquiryId ? 'bg-admin-light' : 'hover:bg-admin/5')}>
                      <td className="px-4 py-3 whitespace-nowrap"><span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">{catLabel(inq.category)}</span></td>
                      <td className="px-4 py-3 max-w-[420px]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {inq.images.length > 0 && <Paperclip className="w-3 h-3 text-muted-foreground shrink-0" />}
                          <span className="text-[13px] font-medium text-foreground truncate">{inq.title}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">#{inq.inquiryId}</div>
                      </td>
                      <td className="px-4 py-3"><StatBadge status={inq.status} /></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmt(inq.createdAt).slice(0, 10)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && !isError && items.length > 0 && (
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
              <button onClick={() => setParams(p => ({ ...p, page: page - 1 }))} disabled={page <= 1} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-gray-50 disabled:opacity-40">이전</button>
              <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
              <button onClick={() => setParams(p => ({ ...p, page: page + 1 }))} disabled={page >= totalPages} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-gray-50 disabled:opacity-40">다음</button>
            </div>
          )}
        </div>
      </div>

      {selectedId != null && <InquiryDetailDrawer inquiryId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  )
}
