import { useState } from 'react'
import { Search, Plus, Pin, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import NoticeDrawer from './notices/NoticeDrawer'
import { SAMPLE_NOTICES, type Notice } from './notices/noticeData'

// 카테고리 배지 — 색상은 카테고리 구분용(팔레트)이라 의미색으로 유지
const CAT_BADGE: Record<string, string> = {
  일반: 'bg-gray-100 text-gray-500',
  이벤트: 'bg-violet-100 text-violet-700',
  업데이트: 'bg-blue-100 text-blue-700',
  점검: 'bg-orange-100 text-orange-700',
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, { dot: string; text: string; label: string }> = {
    ACTIVE: { dot: 'bg-green-500', text: 'text-green-700', label: '게시중' },
    HIDDEN: { dot: 'bg-gray-400', text: 'text-gray-500', label: '숨김' },
    DELETED: { dot: 'bg-red-500', text: 'text-red-600', label: '삭제' },
  }
  const s = map[status] || map.HIDDEN
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('w-[7px] h-[7px] rounded-full inline-block', s.dot)} />
      <span className={cn('text-xs font-semibold', s.text)}>{s.label}</span>
    </span>
  )
}

type DrawerState = { notice: Notice | null; mode: 'view' | 'edit' | 'create' } | null

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>(SAMPLE_NOTICES)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('전체')
  const [filterStatus, setFilterStatus] = useState('전체')
  const [sort, setSort] = useState('최신순')
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [drawer, setDrawer] = useState<DrawerState>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const filtered = notices
    .filter(n => filterCat === '전체' || n.category === filterCat)
    .filter(n => filterStatus === '전체' || n.status === filterStatus)
    .filter(n => !search || n.title.includes(search) || n.content.includes(search))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      if (sort === '조회순') return b.views - a.views
      return b.id.localeCompare(a.id)
    })

  const allChecked = filtered.length > 0 && filtered.every(n => checked.has(n.id))

  const toggleAll = () => {
    if (allChecked) setChecked(new Set())
    else setChecked(new Set(filtered.map(n => n.id)))
  }

  const toggleOne = (id: string) => {
    const s = new Set(checked)
    s.has(id) ? s.delete(id) : s.add(id)
    setChecked(s)
  }

  const handleSave = (data: Partial<Notice>) => {
    if (drawer?.mode === 'create') {
      const newId = `NTC-${String(notices.length + 1).padStart(4, '0')}`
      setNotices([{ ...data, id: newId, views: 0, date: '2026-07-09', author: '김관리자' } as Notice, ...notices])
    } else if (drawer?.notice) {
      setNotices(notices.map(n => n.id === drawer.notice!.id ? { ...n, ...data } : n))
    }
  }

  const handleDelete = (id: string) => {
    setNotices(notices.map(n => n.id === id ? { ...n, status: 'DELETED' } : n))
  }

  const PIN_LIMIT = 3
  const pinnedCount = notices.filter(n => n.pinned && n.status !== 'DELETED').length
  const activeCount = notices.filter(n => n.status === 'ACTIVE').length
  const hiddenCount = notices.filter(n => n.status === 'HIDDEN').length
  const totalCount = notices.filter(n => n.status !== 'DELETED').length
  const pinFull = pinnedCount >= PIN_LIMIT

  const selectCls =
    'px-3 py-2 rounded-lg border-[1.5px] border-border text-[13px] text-foreground bg-white outline-none cursor-pointer focus:border-admin'

  return (
    <div className="p-7">
      {/* Filter bar */}
      <div className="bg-white rounded-xl px-5 py-4 shadow-sm border border-border mb-5 flex gap-2.5 items-center flex-wrap">
        <div className="relative flex-1 basis-[200px] min-w-[180px]">
          <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className={cn(selectCls, 'w-full pl-9')}
            placeholder="제목, 내용 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className={selectCls} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          {['전체', '일반', '이벤트', '업데이트', '점검'].map(v => <option key={v}>{v}</option>)}
        </select>
        <select className={selectCls} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          {['전체', 'ACTIVE', 'HIDDEN', 'DELETED'].map(v => <option key={v}>{v}</option>)}
        </select>
        <select className={selectCls} value={sort} onChange={e => setSort(e.target.value)}>
          {['최신순', '조회순'].map(v => <option key={v}>{v}</option>)}
        </select>
        <button className="px-5 py-2 bg-admin text-white rounded-lg font-semibold text-[13px] shrink-0 hover:bg-admin-hover transition-colors">
          검색
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl shadow-sm border border-border">
        {/* Table header row */}
        <div className="px-5 py-4 border-b border-[#f3f4f6] flex items-center justify-between">
          <span className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-bold text-sm text-foreground">공지 목록</span>
            <span className="text-muted-foreground text-xs">· 총 {totalCount}건</span>
            <span className="text-muted-foreground text-xs">·</span>
            <span
              className={cn(
                'text-xs font-semibold',
                pinFull ? 'text-amber-600 bg-amber-100 px-1.5 py-px rounded' : 'text-muted-foreground',
              )}
            >
              고정 {pinnedCount}/{PIN_LIMIT}
            </span>
            <span className="text-muted-foreground text-xs">· 게시중 <span className="text-green-700 font-semibold">{activeCount}</span></span>
            <span className="text-muted-foreground text-xs">· 숨김 <span className="text-gray-500 font-semibold">{hiddenCount}</span></span>
          </span>
          <button
            onClick={() => setDrawer({ notice: null, mode: 'create' })}
            className="flex items-center gap-1.5 px-4 py-2 bg-admin text-white rounded-lg font-semibold text-[13px] hover:bg-admin-hover transition-colors"
          >
            <Plus size={14} strokeWidth={2.5} />
            새 공지 작성
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="w-11 px-4 py-2.5">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} className="cursor-pointer accent-admin" />
                </th>
                {['제목', '분류', '상태', '조회수', '게시일', ''].map((h, i) => (
                  <th key={i} className="px-3.5 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(notice => {
                const isPinned = notice.pinned
                return (
                  <tr
                    key={notice.id}
                    className={cn(
                      'border-b border-[#f3f4f6] cursor-pointer transition-colors',
                      isPinned ? 'bg-amber-50 hover:bg-amber-100/60' : 'bg-white hover:bg-gray-50',
                    )}
                    onClick={() => setDrawer({ notice, mode: 'view' })}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={checked.has(notice.id)} onChange={() => toggleOne(notice.id)} className="cursor-pointer accent-admin" />
                    </td>
                    {/* Title */}
                    <td className="px-3.5 py-3 max-w-[340px] min-w-[220px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {notice.pinned && <Pin size={13} className="text-amber-500 fill-amber-500" />}
                        {notice.important && (
                          <span className="text-[11px] font-bold text-red-600 bg-red-100 px-1.5 py-px rounded">중요</span>
                        )}
                        <span className="text-[13px] font-semibold text-foreground">{notice.title}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground/70 mt-[3px]">{notice.id}</div>
                    </td>
                    {/* Category */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span className={cn('text-xs font-semibold px-2.5 py-[3px] rounded-full', CAT_BADGE[notice.category] || CAT_BADGE['일반'])}>
                        {notice.category}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <StatusDot status={notice.status} />
                    </td>
                    {/* Views */}
                    <td className="px-3.5 py-3 text-[13px] text-foreground whitespace-nowrap">
                      {notice.views.toLocaleString()}
                    </td>
                    {/* Date */}
                    <td className="px-3.5 py-3 text-[13px] text-muted-foreground whitespace-nowrap">
                      {notice.date}
                    </td>
                    {/* Actions */}
                    <td className="px-3.5 py-3" onClick={e => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === notice.id ? null : notice.id)}
                          className="text-muted-foreground p-1 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        {menuOpen === notice.id && (
                          <div className="absolute right-0 top-full bg-white border border-border rounded-lg shadow-lg z-10 min-w-[100px] overflow-hidden">
                            {[
                              { label: '수정', action: () => { setDrawer({ notice, mode: 'edit' }); setMenuOpen(null) } },
                              { label: '숨김', action: () => { setNotices(notices.map(n => n.id === notice.id ? { ...n, status: 'HIDDEN' } : n)); setMenuOpen(null) } },
                              { label: '삭제', action: () => { handleDelete(notice.id); setMenuOpen(null) }, danger: true },
                            ].map(item => (
                              <button
                                key={item.label}
                                onClick={item.action}
                                className={cn(
                                  'block w-full px-3.5 py-2.5 text-left text-[13px] hover:bg-gray-50 transition-colors',
                                  (item as { danger?: boolean }).danger ? 'text-red-500' : 'text-foreground',
                                )}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {drawer && (
        <NoticeDrawer
          notice={drawer.notice}
          mode={drawer.mode}
          onClose={() => setDrawer(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {/* Close menu on outside click */}
      {menuOpen && (
        <div className="fixed inset-0 z-[9]" onClick={() => setMenuOpen(null)} />
      )}
    </div>
  )
}
