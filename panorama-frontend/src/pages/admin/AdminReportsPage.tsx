import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, Flag, Trash2, Eye, ShieldAlert, Save, User, AlertCircle, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage } from '@/api/client'
import { useAdminReports, useAdminReport, useProcessReport, useBulkProcessReports } from '@/api/admin'
import type {
  ReportSearchRequest,
  ReportResponse,
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from '@/types/admin'

// ── enum 라벨/배지 ───────────────────────────────────────────────────────────
const REASON_LABEL: Record<ReportReason, string> = { ABUSE: '욕설·비방', SPAM: '스팸', MISINFO: '허위정보', OBSCENE: '음란성', ETC: '기타' }
const REASON_BADGE: Record<ReportReason, string> = {
  ABUSE: 'bg-red-50 text-red-600', SPAM: 'bg-orange-50 text-orange-600', MISINFO: 'bg-amber-50 text-amber-700', OBSCENE: 'bg-pink-50 text-pink-600', ETC: 'bg-gray-100 text-gray-500',
}
const STATUS_META: Record<ReportStatus, { label: string; bg: string; text: string; dot: string }> = {
  PENDING: { label: '대기', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
  REVIEWING: { label: '검토중', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  RESOLVED: { label: '완료', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  REJECTED: { label: '반려', bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
}
const TARGET_LABEL: Record<ReportTargetType, string> = { POST: '게시글', COMMENT: '댓글', REVIEW: '리뷰', USER: '유저' }
const TARGET_BADGE: Record<ReportTargetType, string> = {
  POST: 'bg-blue-50 text-blue-700', COMMENT: 'bg-violet-50 text-violet-700', REVIEW: 'bg-teal-50 text-teal-700', USER: 'bg-gray-100 text-gray-600',
}
const fmt = (iso?: string | null) => (iso ? iso.replace('T', ' ').slice(0, 16) : '-')

function StatusBadge({ s }: { s: ReportStatus }) {
  const c = STATUS_META[s]
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium', c.bg, c.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />{c.label}
    </span>
  )
}

// ── Detail slide-over ────────────────────────────────────────────────────────
function DetailPanel({ reportId, onClose }: { reportId: number; onClose: () => void }) {
  const me = useAuthStore(s => s.user)
  const { data, isLoading, isError, error, refetch } = useAdminReport(reportId)
  const processMut = useProcessReport()
  const bulkMut = useBulkProcessReports()
  const [status, setStatus] = useState<ReportStatus | ''>('')
  const [note, setNote] = useState('')

  const core = data?.report
  const target = data?.target
  const related = data?.relatedReports ?? []

  const doContentAction = (action: 'HIDDEN' | 'DELETED') =>
    processMut.mutate({ reportId, body: { action, reason: note || undefined, handlerUserId: me?.id ?? 0 } }, { onSuccess: onClose })

  const saveStatus = () => {
    if (!status) return
    bulkMut.mutate({ reportIds: [reportId], status, handlerUserId: me?.id ?? 0 }, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-[480px] h-full bg-white shadow-2xl flex flex-col overflow-hidden" style={{ animation: 'slideIn .22s cubic-bezier(.25,.46,.45,.94) both' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {core && <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold', TARGET_BADGE[core.targetType])}>{TARGET_LABEL[core.targetType]}</span>}
            {core && <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium', REASON_BADGE[core.reasonType])}>{REASON_LABEL[core.reasonType]}</span>}
            {core && <StatusBadge s={core.status} />}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground"><X size={17} /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="py-24 text-center text-sm text-muted-foreground">불러오는 중…</div>
          ) : isError || !core ? (
            <div className="py-24 text-center">
              <AlertCircle size={22} className="mx-auto mb-2 text-red-400" />
              <p className="text-sm text-red-600 mb-3">{getErrorMessage(error, '신고 상세를 불러오지 못했습니다.')}</p>
              <button onClick={() => refetch()} className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-gray-50">다시 시도</button>
            </div>
          ) : (
            <>
              <div className="px-6 pt-5 pb-4">
                <div className="text-[10px] font-mono text-muted-foreground mb-1">RPT-{String(core.reportId).padStart(4, '0')}</div>
                <h2 className="text-sm font-semibold text-foreground leading-snug">{target?.authorNickname ? `피신고자: ${target.authorNickname}` : '신고 상세'}</h2>
              </div>

              {/* 원본 콘텐츠 */}
              <div className="mx-6 mb-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">원본 콘텐츠</span>
                  {target?.deleted && <span className="text-[10px] text-red-500 font-semibold">삭제됨</span>}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">{target?.content ?? (target ? '(내용 없음 · 유저 대상)' : '원본을 찾을 수 없습니다.')}</p>
                {target && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>작성자: {target.authorNickname}</span><span>·</span><span>{fmt(target.createdAt)}</span>
                  </div>
                )}
              </div>

              {/* 신고 상세 */}
              <div className="px-6 mb-5">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">신고 상세 내용</div>
                <div className="text-xs text-gray-700 leading-relaxed bg-red-50 border border-red-100 rounded-xl p-3.5">{core.content}</div>
              </div>

              {/* 신고자 */}
              <div className="px-6 mb-5">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">신고자</div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0"><User size={13} className="text-gray-500" /></div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">{core.reporterNickname}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{fmt(core.createdAt)} 접수</div>
                  </div>
                </div>
              </div>

              {/* 누적 신고 */}
              {related.length > 0 && (
                <div className="px-6 mb-5">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                    동일 대상 누적 신고 <span className="text-red-500 font-bold">+{related.length}건</span>
                  </div>
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    {related.slice(0, 5).map(r => (
                      <div key={r.reportId} className="flex items-center justify-between px-4 py-2.5 text-xs border-b border-gray-50 last:border-0">
                        <span className="font-mono text-muted-foreground text-[10px]">RPT-{String(r.reportId).padStart(4, '0')}</span>
                        <span className={cn('px-2 py-0.5 rounded-full text-[11px]', REASON_BADGE[r.reasonType])}>{REASON_LABEL[r.reasonType]}</span>
                        <span className="text-muted-foreground text-[10px]">{fmt(r.createdAt).slice(0, 10)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 처리 */}
              <div className="px-6 mb-8">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">처리</div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1.5 block font-medium">처리 사유</label>
                    <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="처리 사유를 입력하세요..." rows={2}
                      className="w-full text-xs border border-border rounded-xl px-3 py-2.5 bg-white text-gray-700 resize-none outline-none focus:border-admin" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => doContentAction('HIDDEN')} disabled={processMut.isPending}
                      className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 text-[11px] font-semibold hover:bg-amber-100 disabled:opacity-50">
                      <Eye size={12} /> {core.targetType === 'USER' ? '제재(정지)' : '콘텐츠 숨김'}
                    </button>
                    <button onClick={() => doContentAction('DELETED')} disabled={processMut.isPending}
                      className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-[11px] font-semibold hover:bg-red-100 disabled:opacity-50">
                      <Trash2 size={12} /> {core.targetType === 'USER' ? '강제탈퇴' : '콘텐츠 삭제'}
                    </button>
                    <div className="relative">
                      <ShieldAlert size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <select value={status} onChange={e => setStatus(e.target.value as ReportStatus)}
                        className="w-full h-full appearance-none text-[11px] border border-border rounded-xl pl-6 pr-2 py-2 bg-white text-gray-700 outline-none focus:border-admin cursor-pointer">
                        <option value="">상태변경</option>
                        <option value="PENDING">대기</option>
                        <option value="REVIEWING">검토중</option>
                        <option value="RESOLVED">완료</option>
                        <option value="REJECTED">반려</option>
                      </select>
                    </div>
                  </div>
                  <button onClick={saveStatus} disabled={!status || bulkMut.isPending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-semibold bg-admin hover:bg-admin-hover transition-colors disabled:opacity-50">
                    <Save size={13} /> 상태 변경 저장
                  </button>
                  {(processMut.isError || bulkMut.isError) && (
                    <p className="text-[11px] text-red-600 text-center">{getErrorMessage(processMut.error ?? bulkMut.error, '처리에 실패했습니다. 다시 시도해 주세요.')}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0 } to { transform: translateX(0); opacity: 1 } }`}</style>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AdminReportsPage() {
  const me = useAuthStore(s => s.user)
  const [searchInput, setSearchInput] = useState('')
  const [fType, setFType] = useState<'전체' | ReportTargetType>('전체')
  const [fReason, setFReason] = useState<'전체' | ReportReason>('전체')
  const [fStatus, setFStatus] = useState<'전체' | ReportStatus>('전체')
  const [includeAll, setIncludeAll] = useState(false)
  const [params, setParams] = useState<ReportSearchRequest>({ page: 1, size: 20 })
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [selected, setSelected] = useState<number | null>(null)
  const [searchParams] = useSearchParams()

  // 대시보드에서 ?open=<id> 로 진입 시 해당 신고 상세 자동 오픈 (숫자만 허용)
  useEffect(() => {
    const open = searchParams.get('open')
    const id = open ? Number(open) : NaN
    if (Number.isInteger(id) && id > 0) setSelected(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { data, isLoading, isError, error, refetch, isFetching } = useAdminReports(params)
  const bulkMut = useBulkProcessReports()
  const reports = data?.content ?? []
  const totalPages = data?.totalPages ?? 1
  const page = params.page ?? 1

  const applyFilters = () => {
    setChecked(new Set())
    setParams({
      searchString: searchInput.trim() || undefined,
      targetType: fType === '전체' ? undefined : fType,
      reasonType: fReason === '전체' ? undefined : fReason,
      status: fStatus === '전체' ? undefined : fStatus,
      includeAll,
      page: 1,
      size: 20,
    })
  }

  const allChecked = reports.length > 0 && reports.every(r => checked.has(r.reportId))
  const toggleAll = () => setChecked(allChecked ? new Set() : new Set(reports.map(r => r.reportId)))
  const toggleOne = (id: number) => setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const bulk = (status: ReportStatus) => {
    if (checked.size === 0) return
    bulkMut.mutate({ reportIds: [...checked], status, handlerUserId: me?.id ?? 0 }, { onSuccess: () => setChecked(new Set()) })
  }

  const selCls = 'appearance-none pl-3 pr-7 py-2 text-xs border border-border rounded-xl bg-white text-gray-600 outline-none cursor-pointer focus:border-admin'

  return (
    <div className="p-7">
      <div className="space-y-5">
        {/* Filter bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilters()}
                placeholder="신고 내용, 신고자 닉네임 검색..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-border rounded-xl bg-gray-50 outline-none focus:border-admin text-gray-700" />
            </div>
            <select value={fType} onChange={e => setFType(e.target.value as typeof fType)} className={selCls}>
              <option value="전체">대상 전체</option><option value="POST">게시글</option><option value="COMMENT">댓글</option><option value="REVIEW">리뷰</option><option value="USER">유저</option>
            </select>
            <select value={fReason} onChange={e => setFReason(e.target.value as typeof fReason)} className={selCls}>
              <option value="전체">사유 전체</option><option value="ABUSE">욕설·비방</option><option value="SPAM">스팸</option><option value="MISINFO">허위정보</option><option value="OBSCENE">음란성</option><option value="ETC">기타</option>
            </select>
            <select value={fStatus} onChange={e => setFStatus(e.target.value as typeof fStatus)} className={selCls}>
              <option value="전체">상태 전체</option><option value="PENDING">대기</option><option value="REVIEWING">검토중</option><option value="RESOLVED">완료</option><option value="REJECTED">반려</option>
            </select>
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" checked={includeAll} onChange={e => setIncludeAll(e.target.checked)} className="accent-admin" />
              완료 포함
            </label>
            <button onClick={applyFilters} className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-admin hover:bg-admin-hover transition-colors shrink-0">검색</button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag size={13} className="text-admin" />
              <span className="text-sm font-semibold text-foreground">신고 목록</span>
              <span className="text-[11px] text-muted-foreground ml-1">총 {data?.totalElements ?? 0}건</span>
              {isFetching && <span className="text-[11px] text-muted-foreground">· 갱신 중…</span>}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#F9F9F9]">
                  <th className="pl-5 pr-3 py-3 text-left w-8"><input type="checkbox" checked={allChecked} onChange={toggleAll} className="accent-admin cursor-pointer" /></th>
                  {['ID', '대상', '신고 대상', '사유', '신고자', '상태', '신고일시'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={8} className="px-4 py-16 text-center text-sm text-muted-foreground">불러오는 중…</td></tr>
                ) : isError ? (
                  <tr><td colSpan={8} className="px-4 py-16 text-center">
                    <AlertCircle size={22} className="mx-auto mb-2 text-red-400" />
                    <p className="text-sm text-red-600 mb-3">{getErrorMessage(error, '신고 목록을 불러오지 못했습니다.')}</p>
                    <button onClick={() => refetch()} className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-gray-50">다시 시도</button>
                  </td></tr>
                ) : reports.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-16 text-center">
                    <Inbox size={22} className="mx-auto mb-2 text-gray-300" /><p className="text-sm text-muted-foreground">조건에 맞는 신고가 없습니다.</p>
                  </td></tr>
                ) : (
                  reports.map((r: ReportResponse) => (
                    <tr key={r.reportId} onClick={() => setSelected(r.reportId)}
                      className={cn('border-b border-gray-50 cursor-pointer transition-colors', selected === r.reportId ? 'bg-admin-light' : 'hover:bg-gray-50')}
                      style={r.status === 'PENDING' ? { boxShadow: 'inset 4px 0 0 #f87171' } : undefined}>
                      <td className="pl-5 pr-3 py-3.5 w-8" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={checked.has(r.reportId)} onChange={() => toggleOne(r.reportId)} className="accent-admin cursor-pointer" />
                      </td>
                      <td className="px-3 py-3.5"><span className="text-[10px] font-mono text-muted-foreground">RPT-{String(r.reportId).padStart(4, '0')}</span></td>
                      <td className="px-3 py-3.5"><span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold', TARGET_BADGE[r.targetType])}>{TARGET_LABEL[r.targetType]}</span></td>
                      <td className="px-3 py-3.5 max-w-[200px]"><span className="text-[11px] text-gray-700 leading-snug line-clamp-2">{r.targetSummary ?? '(원본 없음)'}</span></td>
                      <td className="px-3 py-3.5 whitespace-nowrap"><span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium', REASON_BADGE[r.reasonType])}>{REASON_LABEL[r.reasonType]}</span></td>
                      <td className="px-3 py-3.5"><span className="text-[11px] text-gray-500">{r.reporterNickname}</span></td>
                      <td className="px-3 py-3.5"><StatusBadge s={r.status} /></td>
                      <td className="px-3 py-3.5 whitespace-nowrap"><span className="text-[10px] text-muted-foreground">{fmt(r.createdAt)}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer: bulk + pagination */}
          {!isLoading && !isError && reports.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {checked.size > 0 && <span className="text-[11px] text-muted-foreground mr-1">{checked.size}건 선택</span>}
                <button onClick={() => bulk('REVIEWING')} disabled={checked.size === 0 || bulkMut.isPending} className="px-3 py-1.5 text-[11px] font-semibold border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 disabled:opacity-40">검토 시작</button>
                <button onClick={() => bulk('RESOLVED')} disabled={checked.size === 0 || bulkMut.isPending} className="px-3 py-1.5 text-[11px] font-semibold border border-green-300 text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-40">처리 완료</button>
                <button onClick={() => bulk('REJECTED')} disabled={checked.size === 0 || bulkMut.isPending} className="px-3 py-1.5 text-[11px] font-semibold border border-border text-gray-500 rounded-lg hover:bg-gray-50 disabled:opacity-40">반려</button>
                {bulkMut.isError && <span className="text-[11px] text-red-600 ml-1">{getErrorMessage(bulkMut.error, '일괄 처리에 실패했습니다.')}</span>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setParams(p => ({ ...p, page: page - 1 }))} disabled={page <= 1} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-gray-50 disabled:opacity-40">이전</button>
                <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
                <button onClick={() => setParams(p => ({ ...p, page: page + 1 }))} disabled={page >= totalPages} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-gray-50 disabled:opacity-40">다음</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selected != null && <DetailPanel reportId={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
