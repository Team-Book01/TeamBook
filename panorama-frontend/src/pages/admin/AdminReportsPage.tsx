import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, Flag, Save, User, AlertCircle, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage } from '@/api/client'
import { useAdminReports, useAdminReport, useProcessReport, useBulkProcessReports } from '@/api/admin'
import { sanitizePostHtml } from '@/pages/community/utils'
import OriginLink from '@/components/admin/OriginLink'
import AdminSelect from '@/components/admin/AdminSelect'
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
  RESOLVED: { label: '완료', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  REJECTED: { label: '반려', bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
}
const TARGET_LABEL: Record<ReportTargetType, string> = { POST: '게시글', COMMENT: '댓글', REVIEW: '리뷰', USER: '유저' }
const TARGET_BADGE: Record<ReportTargetType, string> = {
  POST: 'bg-blue-50 text-blue-700', COMMENT: 'bg-violet-50 text-violet-700', REVIEW: 'bg-teal-50 text-teal-700', USER: 'bg-gray-100 text-gray-600',
}
const fmt = (iso?: string | null) => (iso ? iso.replace('T', ' ').slice(0, 16) : '-')

// 상세 패널의 처리 방식. 앞의 둘은 콘텐츠에 실제 조치를 하고(신고는 자동 RESOLVED),
// 뒤의 둘은 콘텐츠를 건드리지 않고 신고 상태만 바꾼다. 배타적이라 라디오로 받는다.
type Decision = 'HIDDEN' | 'DELETED' | 'RESOLVED' | 'REJECTED'
const DECISIONS: { value: Decision; label: string; userLabel?: string; desc: string; tone: string }[] = [
  { value: 'HIDDEN', label: '콘텐츠 숨김', userLabel: '제재(정지)', desc: '원본을 숨기고 신고를 완료 처리합니다.', tone: 'text-amber-700' },
  { value: 'DELETED', label: '콘텐츠 삭제', userLabel: '강제탈퇴', desc: '원본을 삭제하고 신고를 완료 처리합니다.', tone: 'text-red-600' },
  { value: 'RESOLVED', label: '조치 없이 완료', desc: '콘텐츠는 그대로 두고 신고만 종결합니다.', tone: 'text-green-700' },
  { value: 'REJECTED', label: '반려', desc: '위반이 아니라고 판단해 신고를 반려합니다.', tone: 'text-gray-500' },
]

// 서버가 프론트가 모르는 상태를 내려도(구버전 API, 마이그레이션 전 데이터, enum 추가)
// 목록 전체가 죽지 않도록 원래 값을 그대로 보여주는 회색 배지로 떨어뜨린다.
const UNKNOWN_STATUS = { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' }

function StatusBadge({ s }: { s: ReportStatus }) {
  const c = STATUS_META[s] ?? { ...UNKNOWN_STATUS, label: s ?? '알 수 없음' }
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
  const [decision, setDecision] = useState<Decision | ''>('')
  const [note, setNote] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [skipped, setSkipped] = useState(false)
  const [missingDecision, setMissingDecision] = useState(false)

  const core = data?.report
  const target = data?.target
  const related = data?.relatedReports ?? []
  const closed = core?.status === 'RESOLVED' || core?.status === 'REJECTED'
  const pending = processMut.isPending || bulkMut.isPending

  const pick = (d: Decision) => {
    setDecision(d)
    setConfirmDelete(false)
    setSkipped(false)
    setMissingDecision(false)
  }

  // 저장은 이 한 곳에서만 커밋한다. 라디오 선택은 아무것도 보내지 않는다.
  // 콘텐츠 조치(HIDDEN/DELETED)는 백엔드가 상태를 RESOLVED 로 확정하므로 상태 선택과 배타적이다.
  const save = () => {
    if (pending || me?.id == null) return
    // 버튼을 disabled 로 막지 않고 여기서 걸러낸다. disabled 면 클릭 이벤트가 안 나가
    // "왜 안 되는지"를 누른 순간에 알려줄 방법이 없다.
    if (!decision) {
      setMissingDecision(true)
      return
    }
    if (decision === 'DELETED' && !confirmDelete) {
      setConfirmDelete(true)
      return
    }
    const reason = note.trim() || undefined
    if (decision === 'HIDDEN' || decision === 'DELETED') {
      processMut.mutate({ reportId, body: { action: decision, reason, handlerUserId: me.id } }, { onSuccess: onClose })
    } else {
      bulkMut.mutate(
        { reportIds: [reportId], status: decision, reason, handlerUserId: me.id },
        // done 0 = 이미 종결돼 건너뛴 것. 성공처럼 닫으면 안 바뀐 걸 바뀐 줄 안다.
        { onSuccess: r => (r.done > 0 ? onClose() : setSkipped(true)) },
      )
    }
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
                {/* 게시글 본문만 에디터 HTML 이다(댓글·리뷰는 평문, 유저 대상은 본문 자체가 없다).
                    신고당한 글 = 악의적일 가능성이 가장 높은 콘텐츠를 관리자 세션에서 여는 자리라
                    커뮤니티 화면과 같은 sanitize 를 반드시 거친다. */}
                {core.targetType === 'POST' && target?.content ? (
                  <div
                    className="text-xs text-gray-600 leading-relaxed max-h-56 overflow-y-auto break-words
                      [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-2 [&_p]:my-1"
                    dangerouslySetInnerHTML={{ __html: sanitizePostHtml(target.content) }}
                  />
                ) : (
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">
                    {target?.content ?? (target ? '(내용 없음 · 유저 대상)' : '원본을 찾을 수 없습니다.')}
                  </p>
                )}
                {target && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground min-w-0">
                      <span className="truncate">작성자: {target.authorNickname}</span><span>·</span><span className="shrink-0">{fmt(target.createdAt)}</span>
                    </div>
                    <OriginLink postId={target.linkPostId} status={target.status} />
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

              {/* 처리 내역 — 이미 처리된 신고에만. 누가·언제·왜를 한자리에 보여준다.
                  (사유는 대상 단위라, 같은 대상의 다른 신고가 처리되면서 함께 종결된 건도 같은 값이 보인다) */}
              {core.processedAt && (
                <div className="px-6 mb-5">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">처리 내역</div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
                      <span>처리자: {core.handlerNickname ?? '-'}</span><span>·</span><span>{fmt(core.processedAt)}</span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {core.processReason || <span className="text-muted-foreground">(처리 사유 없음)</span>}
                    </p>
                  </div>
                </div>
              )}

              {/* 처리 — 선택만으로는 아무것도 반영되지 않고, 아래 저장 버튼에서 한 번에 커밋된다. */}
              <div className="px-6 mb-8">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">처리</div>
                {closed ? (
                  <p className="text-xs text-muted-foreground bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-3">
                    이미 종결된 신고입니다. 추가 처리할 수 없습니다.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-muted-foreground block font-medium">처리 방식</label>
                      {DECISIONS.map(d => (
                        <label key={d.value}
                          className={cn('flex items-start gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors',
                            decision === d.value ? 'border-admin bg-admin-light' : 'border-border hover:bg-gray-50')}>
                          <input type="radio" name={`decision-${reportId}`} value={d.value} checked={decision === d.value}
                            onChange={() => pick(d.value)} className="accent-admin w-3 h-3 mt-[3px] shrink-0" />
                          <span className="min-w-0">
                            <span className={cn('block text-[11px] font-semibold', d.tone)}>
                              {core.targetType === 'USER' && d.userLabel ? d.userLabel : d.label}
                            </span>
                            <span className="block text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{d.desc}</span>
                          </span>
                        </label>
                      ))}
                    </div>

                    <div>
                      <label className="text-[11px] text-muted-foreground mb-1.5 block font-medium">처리 사유</label>
                      <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="처리 사유를 입력하세요..." rows={2} maxLength={500}
                        className="w-full text-xs border border-border rounded-xl px-3 py-2.5 bg-white text-gray-700 resize-none outline-none focus:border-admin" />
                    </div>

                    {confirmDelete && (
                      <p className="flex items-start gap-1.5 text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                        <AlertCircle size={13} className="shrink-0 mt-px" />
                        <span>{core.targetType === 'USER' ? '해당 사용자를 강제탈퇴시킵니다.' : '원본 콘텐츠를 삭제합니다.'} 되돌릴 수 없습니다. 다시 누르면 실행됩니다.</span>
                      </p>
                    )}

                    {/* 선택 없이 저장을 눌렀을 때만 뜬다. 버튼 아래에 두면 패널 맨 끝이라
                        화면 밖으로 밀리므로 위에 붙인다. */}
                    {missingDecision && (
                      <p className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                        <AlertCircle size={13} className="shrink-0" />
                        처리 방식을 먼저 선택하세요.
                      </p>
                    )}

                    <button onClick={save} disabled={pending}
                      className={cn('w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-semibold transition-colors disabled:opacity-50',
                        confirmDelete ? 'bg-red-600 hover:bg-red-700' : 'bg-admin hover:bg-admin-hover')}>
                      <Save size={13} /> {pending ? '처리 중…' : confirmDelete ? '삭제 확인' : '상태 변경 저장'}
                    </button>

                    {skipped && <p className="text-[11px] text-amber-600 text-center">이미 종결된 신고라 변경되지 않았습니다.</p>}
                    {(processMut.isError || bulkMut.isError) && (
                      <p className="text-[11px] text-red-600 text-center">{getErrorMessage(processMut.error ?? bulkMut.error, '처리에 실패했습니다. 다시 시도해 주세요.')}</p>
                    )}
                  </div>
                )}
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
  // 신고 관리는 처리할 일의 목록이라 미처리(대기)로 시작한다. 목록의 기본 조회 조건과 맞춘다.
  const [fStatus, setFStatus] = useState<'전체' | ReportStatus>('PENDING')
  // 서버도 status 미지정이면 PENDING 만 주지만, 셀렉트에 보이는 값과 실제 조회 조건이
  // 같은 자리에서 읽히도록 명시한다.
  const [params, setParams] = useState<ReportSearchRequest>({ status: 'PENDING', page: 1, size: 20 })
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

  // 상태 축은 이 셀렉트 하나가 전담한다. 서버의 includeAll 은 status 미지정일 때만 의미가 있어,
  // '전체'를 골랐을 때만 true 로 실어 보낸다. (둘을 따로 노출하면 "상태 전체인데 대기만 보임" 같은
  // 라벨과 결과가 어긋나는 조합이 생긴다)
  const applyFilters = () => {
    setChecked(new Set())
    setParams({
      searchString: searchInput.trim() || undefined,
      targetType: fType === '전체' ? undefined : fType,
      reasonType: fReason === '전체' ? undefined : fReason,
      status: fStatus === '전체' ? undefined : fStatus,
      includeAll: fStatus === '전체',
      page: 1,
      size: 20,
    })
  }

  const allChecked = reports.length > 0 && reports.every(r => checked.has(r.reportId))
  const toggleAll = () => setChecked(allChecked ? new Set() : new Set(reports.map(r => r.reportId)))
  const toggleOne = (id: number) => setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const bulk = (status: ReportStatus) => {
    if (checked.size === 0 || me?.id == null) return
    bulkMut.mutate({ reportIds: [...checked], status, handlerUserId: me.id }, { onSuccess: () => setChecked(new Set()) })
  }

  return (
    <div className="p-6">
      <div className="space-y-5">
        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-border px-5 py-4 shadow-sm flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilters()}
              placeholder="신고 내용, 신고자 닉네임 검색"
              className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-border bg-gray-50 text-foreground outline-none focus:border-admin" />
          </div>
          <AdminSelect value={fType} onChange={e => setFType(e.target.value as typeof fType)}>
            <option value="전체">대상 전체</option><option value="POST">게시글</option><option value="COMMENT">댓글</option><option value="REVIEW">리뷰</option><option value="USER">유저</option>
          </AdminSelect>
          <AdminSelect value={fReason} onChange={e => setFReason(e.target.value as typeof fReason)}>
            <option value="전체">사유 전체</option><option value="ABUSE">욕설·비방</option><option value="SPAM">스팸</option><option value="MISINFO">허위정보</option><option value="OBSCENE">음란성</option><option value="ETC">기타</option>
          </AdminSelect>
          <AdminSelect value={fStatus} onChange={e => setFStatus(e.target.value as typeof fStatus)}>
            <option value="PENDING">대기</option><option value="RESOLVED">완료</option><option value="REJECTED">반려</option><option value="전체">상태 전체</option>
          </AdminSelect>
          <button onClick={applyFilters} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-admin hover:bg-admin-hover transition-colors">
            <Search size={13} />검색
          </button>
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
