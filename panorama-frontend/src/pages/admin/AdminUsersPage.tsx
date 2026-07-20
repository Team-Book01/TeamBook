import { useState } from 'react'
import { Search, Lock, RotateCcw, AlertTriangle, Flag, AlertCircle, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage } from '@/api/client'
import { useAdminUsers, useAdminUser, useProcessUser } from '@/api/admin'
import DetailDrawer from '@/components/admin/DetailDrawer'
import AdminSelect from '@/components/admin/AdminSelect'
import type { UserSearchRequest, UserStatus, UserRole, Provider, UserDetailResponse, AdminActionLogResponse } from '@/types/admin'

const STATUS_META: Record<UserStatus, { label: string; cls: string }> = {
  ACTIVE: { label: '정상', cls: 'bg-green-50 text-green-700 ring-green-200' },
  SUSPENDED: { label: '이용제한', cls: 'bg-red-50 text-red-600 ring-red-200' },
  DELETED: { label: '탈퇴', cls: 'bg-gray-100 text-gray-500 ring-gray-200' },
}
const PROVIDER_LABEL: Record<Provider, string> = { LOCAL: '이메일', GOOGLE: 'GOOGLE', NAVER: 'NAVER', KAKAO: 'KAKAO' }
const PROVIDER_BADGE: Record<Provider, string> = {
  LOCAL: 'bg-gray-100 text-gray-600', GOOGLE: 'bg-blue-50 text-blue-700', NAVER: 'bg-green-50 text-green-700', KAKAO: 'bg-yellow-50 text-yellow-700',
}
// 같은 로그에 두 종류의 action_type 이 쌓인다. 사용자 관리는 UserAction(SUSPEND/ACTIVATE/DELETE),
// 신고 처리는 유저 대상일 때 ContentAction(HIDDEN/DELETED) 이름으로 남긴다. 둘 다 라벨을 붙인다.
const ACTION_LABEL: Record<string, string> = {
  SUSPEND: '이용제한', ACTIVATE: '제한해제', DELETE: '강제탈퇴',
  HIDDEN: '이용제한 (신고 처리)', DELETED: '강제탈퇴 (신고 처리)',
}
const ACTION_BADGE: Record<string, string> = {
  SUSPEND: 'bg-amber-50 text-amber-700', ACTIVATE: 'bg-green-50 text-green-700', DELETE: 'bg-red-50 text-red-600',
  HIDDEN: 'bg-amber-50 text-amber-700', DELETED: 'bg-red-50 text-red-600',
}
const fmt = (iso?: string | null) => (iso ? iso.slice(0, 10) : '-')
// 조치 이력은 같은 날 여러 번 일어날 수 있어 시각까지 보여준다.
const fmtDateTime = (iso?: string | null) => (iso ? iso.replace('T', ' ').slice(0, 16) : '-')
const initialOf = (nick: string) => nick?.trim()?.[0] ?? '·'

function StatusBadge({ status }: { status: UserStatus }) {
  return <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ring-1', STATUS_META[status].cls)}>{status}</span>
}
function RoleBadge({ role }: { role: UserRole }) {
  return role === 'ADMIN'
    ? <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-admin text-white tracking-wide">ADMIN</span>
    : <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-500 ring-1 ring-gray-200">USER</span>
}

// ── Admin guard modal ────────────────────────────────────────────────────────
function AdminGuardModal({ nickname, onConfirm, onClose }: { nickname: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-[60]" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-[420px] max-w-[92vw] shadow-2xl border border-gray-100" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0 mt-0.5"><AlertTriangle size={18} className="text-red-600" /></div>
          <div>
            <h3 className="text-[14px] font-bold text-foreground">관리자 계정 강제탈퇴</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">오조작 방지를 위한 추가 확인</p>
          </div>
        </div>
        <div className="bg-red-50 rounded-xl p-3.5 mb-4">
          <p className="text-[12px] text-red-700 leading-relaxed">
            <span className="font-bold">{nickname}</span> 은(는) 관리자(ADMIN) 계정입니다. 강제탈퇴 시 권한이 즉시 회수되며 되돌릴 수 없습니다.
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[12px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200">취소</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-[12px] font-bold text-white bg-red-500 hover:bg-red-600">강제탈퇴 확인</button>
        </div>
      </div>
    </div>
  )
}

// ── Detail drawer (공용 DetailDrawer) ──────────────────────────────────────────
function UserDetailDrawer({ userId, onClose }: { userId: number; onClose: () => void }) {
  const me = useAuthStore(s => s.user)
  const { data, isLoading, isError, error, refetch } = useAdminUser(userId)
  const processMut = useProcessUser()
  const [reason, setReason] = useState('')
  const [guard, setGuard] = useState(false)

  const run = (action: 'SUSPEND' | 'ACTIVATE' | 'DELETE') =>
    me?.id != null && processMut.mutate({ userId, body: { action, reason: reason || undefined, handlerUserId: me.id } }, { onSuccess: () => setReason('') })

  const u = data?.user
  const header = u ? (
    <div className="flex items-center gap-2 flex-wrap min-w-0">
      <span className={cn('text-[15px] font-bold truncate', u.status === 'DELETED' ? 'text-gray-400' : 'text-foreground')}>{u.nickname}</span>
      <StatusBadge status={u.status} />
      <RoleBadge role={u.role} />
    </div>
  ) : (
    <span className="text-sm font-bold text-foreground">회원 상세</span>
  )

  return (
    <DetailDrawer onClose={onClose} header={header} width={440}>
      {isLoading ? (
        <div className="p-10 text-center text-sm text-muted-foreground">불러오는 중…</div>
      ) : isError || !data || !u ? (
        <div className="p-8 text-center">
          <AlertCircle size={20} className="mx-auto mb-2 text-red-400" />
          <p className="text-sm text-red-600 mb-3">{getErrorMessage(error, '회원 상세를 불러오지 못했습니다.')}</p>
          <button onClick={() => refetch()} className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-gray-50">다시 시도</button>
        </div>
      ) : (
        <UserDetailBody u={u} logs={data.actionLogs} reason={reason} setReason={setReason} pending={processMut.isPending} onRun={run} onGuard={() => setGuard(true)}
          errorMsg={processMut.isError ? getErrorMessage(processMut.error, '처리에 실패했습니다. 다시 시도해 주세요.') : null} />
      )}
      {guard && u && <AdminGuardModal nickname={u.nickname} onConfirm={() => { setGuard(false); run('DELETE') }} onClose={() => setGuard(false)} />}
    </DetailDrawer>
  )
}

function UserDetailBody({ u, logs, reason, setReason, pending, onRun, onGuard, errorMsg }: {
  u: UserDetailResponse; logs: AdminActionLogResponse[]; reason: string; setReason: (v: string) => void; pending: boolean
  onRun: (a: 'SUSPEND' | 'ACTIVATE' | 'DELETE') => void; onGuard: () => void; errorMsg?: string | null
}) {
  const onDelete = () => (u.role === 'ADMIN' ? onGuard() : onRun('DELETE'))
  return (
    <div className="p-5 space-y-4">
      {/* 프로필 */}
      <div className="flex items-center gap-3.5">
        <div className={cn('w-[52px] h-[52px] rounded-full flex items-center justify-center text-white text-[18px] font-bold shrink-0 shadow-sm', u.status === 'DELETED' ? 'bg-gray-400' : 'bg-admin')}>
          {initialOf(u.nickname)}
        </div>
        <div className="min-w-0">
          <p className={cn('text-[16px] font-bold leading-tight truncate', u.status === 'DELETED' ? 'text-gray-400' : 'text-foreground')}>{u.nickname}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{PROVIDER_LABEL[u.provider]} 가입 · {fmt(u.createdAt)} 가입</p>
        </div>
      </div>

      {/* 받은 신고 */}
      <div className={cn('rounded-xl border p-4', u.reportReceivedCount > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50')}>
        <div className="flex items-center gap-2">
          <Flag size={15} className={u.reportReceivedCount > 0 ? 'text-red-600' : 'text-green-600'} />
          <span className={cn('text-[13px] font-bold', u.reportReceivedCount > 0 ? 'text-red-800' : 'text-green-800')}>받은 신고 {u.reportReceivedCount}건</span>
        </div>
      </div>

      {/* 처리 */}
      {u.status !== 'DELETED' ? (
        <div className="bg-white rounded-xl border border-border p-4 space-y-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">회원 처리</p>
          <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="처리 사유 (선택)" rows={2}
            className="w-full text-[12px] border border-border rounded-lg px-3 py-2 outline-none focus:border-admin resize-none" />
          <div className="flex items-center gap-2">
            {u.status === 'ACTIVE' ? (
              <button onClick={() => onRun('SUSPEND')} disabled={pending} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-amber-400 hover:bg-amber-500 text-white shadow-sm disabled:opacity-50">이용제한</button>
            ) : (
              <button onClick={() => onRun('ACTIVATE')} disabled={pending} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-admin hover:bg-admin-hover text-white shadow-sm disabled:opacity-50">제한해제</button>
            )}
            <button onClick={onDelete} disabled={pending} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-red-500 hover:bg-red-600 text-white shadow-sm disabled:opacity-50">
              {u.role === 'ADMIN' && <Lock size={11} strokeWidth={2.5} />}강제탈퇴
            </button>
          </div>
          {errorMsg && <p className="text-[11px] text-red-600">{errorMsg}</p>}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-2 text-[12px] text-muted-foreground">
          <RotateCcw size={13} /> 탈퇴한 계정 · 조치 불가 (열람만 가능)
        </div>
      )}

      {/* 조치 이력 — 정지·해제가 반복될 수 있어 마지막 사유만으로는 판단이 어렵다.
          "세 번째 정지"와 "첫 정지"는 다른 상황이라 전체를 보여준다. */}
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">조치 이력</p>
        {logs.length === 0 ? (
          <p className="text-[12px] text-muted-foreground bg-gray-50 border border-border rounded-xl px-3.5 py-3">
            아직 조치 이력이 없습니다.
          </p>
        ) : (
          <ul className="rounded-xl border border-border overflow-hidden">
            {logs.map((log, i) => (
              <li key={i} className="px-3.5 py-3 border-b border-gray-100 last:border-0 bg-white">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold', ACTION_BADGE[log.actionType] ?? 'bg-gray-100 text-gray-500')}>
                    {ACTION_LABEL[log.actionType] ?? log.actionType}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{fmtDateTime(log.createdAt)}</span>
                  <span className="text-[10px] text-muted-foreground">· {log.handlerNickname ?? '탈퇴한 관리자'}</span>
                </div>
                <p className="text-[12px] text-gray-700 leading-relaxed mt-1.5 whitespace-pre-wrap">
                  {log.reason || <span className="text-muted-foreground">(사유 없음)</span>}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [searchInput, setSearchInput] = useState('')
  const [fStatus, setFStatus] = useState<'전체' | UserStatus>('전체')
  const [fRole, setFRole] = useState<'전체' | UserRole>('전체')
  const [params, setParams] = useState<UserSearchRequest>({ page: 1, size: 20 })
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data, isLoading, isError, error, refetch, isFetching } = useAdminUsers(params)
  const users = data?.content ?? []
  const page = params.page ?? 1
  const totalPages = data?.totalPages ?? 1

  const apply = () => setParams({
    searchString: searchInput.trim() || undefined,
    status: fStatus === '전체' ? undefined : fStatus,
    role: fRole === '전체' ? undefined : fRole,
    page: 1, size: 20,
  })

  return (
    <div className="p-6">
      <div className="space-y-5">
        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-border px-5 py-4 shadow-sm flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && apply()}
              placeholder="닉네임으로 검색"
              className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-border bg-gray-50 text-foreground outline-none focus:border-admin" />
          </div>
          <AdminSelect value={fStatus} onChange={e => setFStatus(e.target.value as typeof fStatus)}>
            <option value="전체">상태 전체</option><option value="ACTIVE">정상</option><option value="SUSPENDED">이용제한</option><option value="DELETED">탈퇴</option>
          </AdminSelect>
          <AdminSelect value={fRole} onChange={e => setFRole(e.target.value as typeof fRole)}>
            <option value="전체">권한 전체</option><option value="USER">USER</option><option value="ADMIN">ADMIN</option>
          </AdminSelect>
          <button onClick={apply} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-admin hover:bg-admin-hover transition-colors">
            <Search size={13} />검색
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">회원 목록</span>
            <span className="text-xs text-muted-foreground">총 {data?.totalElements ?? 0}명</span>
            {isFetching && <span className="text-xs text-muted-foreground">· 갱신 중…</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  {['회원', '가입경로', '권한', '상태', '가입일'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-left whitespace-nowrap text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="px-4 py-16 text-center text-sm text-muted-foreground">불러오는 중…</td></tr>
                ) : isError ? (
                  <tr><td colSpan={5} className="px-4 py-16 text-center">
                    <AlertCircle size={22} className="mx-auto mb-2 text-red-400" />
                    <p className="text-sm text-red-600 mb-3">{getErrorMessage(error, '회원 목록을 불러오지 못했습니다.')}</p>
                    <button onClick={() => refetch()} className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-gray-50">다시 시도</button>
                  </td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-16 text-center"><Inbox size={22} className="mx-auto mb-2 text-gray-300" /><p className="text-sm text-muted-foreground">회원이 없습니다.</p></td></tr>
                ) : (
                  users.map(u => (
                    <tr key={u.userId} onClick={() => setSelectedId(u.userId)}
                      className={cn('border-b border-gray-100 cursor-pointer transition-colors', selectedId === u.userId ? 'bg-admin-light' : 'hover:bg-admin/5')}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0', u.status === 'DELETED' ? 'bg-gray-400' : 'bg-admin')}>
                            {initialOf(u.nickname)}
                          </div>
                          <span className={cn('text-[13px] font-semibold', u.status === 'DELETED' ? 'text-gray-400 line-through' : 'text-gray-800')}>{u.nickname}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className={cn('text-[10px] px-1.5 py-0.5 rounded font-semibold', PROVIDER_BADGE[u.provider])}>{PROVIDER_LABEL[u.provider]}</span></td>
                      <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                      <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmt(u.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && !isError && users.length > 0 && (
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
              <button onClick={() => setParams(p => ({ ...p, page: page - 1 }))} disabled={page <= 1} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-gray-50 disabled:opacity-40">이전</button>
              <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
              <button onClick={() => setParams(p => ({ ...p, page: page + 1 }))} disabled={page >= totalPages} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-gray-50 disabled:opacity-40">다음</button>
            </div>
          )}
        </div>
      </div>

      {selectedId != null && <UserDetailDrawer userId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  )
}
