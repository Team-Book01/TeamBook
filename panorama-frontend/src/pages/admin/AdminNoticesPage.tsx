import { useState } from 'react'
import NoticeDrawer from './notices/NoticeDrawer'
import { SAMPLE_NOTICES, type Notice } from './notices/noticeData'

const catStyle: Record<string, { bg: string; color: string }> = {
  일반: { bg: '#f3f4f6', color: '#6b7280' },
  이벤트: { bg: '#ede9fe', color: '#7c3aed' },
  업데이트: { bg: '#dbeafe', color: '#1d4ed8' },
  점검: { bg: '#ffedd5', color: '#c2410c' },
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, { dot: string; text: string; label: string }> = {
    ACTIVE: { dot: '#22c55e', text: '#15803d', label: '게시중' },
    HIDDEN: { dot: '#9ca3af', text: '#6b7280', label: '숨김' },
    DELETED: { dot: '#ef4444', text: '#dc2626', label: '삭제' },
  }
  const s = map[status] || map.HIDDEN
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: s.dot, display: 'inline-block' }} />
      <span style={{ color: s.text, fontSize: 12, fontWeight: 600 }}>{s.label}</span>
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

  const selectStyle = {
    padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb',
    fontSize: 13, color: '#374151', backgroundColor: 'white', outline: 'none', cursor: 'pointer',
  }

  return (
    <div className="p-7" style={{ fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif" }}>
      {/* Filter bar */}
      <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2"/><path d="m21 21-4.35-4.35" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            style={{ ...selectStyle, paddingLeft: 34, width: '100%', boxSizing: 'border-box' }}
            placeholder="제목, 내용 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select style={selectStyle} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          {['전체', '일반', '이벤트', '업데이트', '점검'].map(v => <option key={v}>{v}</option>)}
        </select>
        <select style={selectStyle} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          {['전체', 'ACTIVE', 'HIDDEN', 'DELETED'].map(v => <option key={v}>{v}</option>)}
        </select>
        <select style={selectStyle} value={sort} onChange={e => setSort(e.target.value)}>
          {['최신순', '조회순'].map(v => <option key={v}>{v}</option>)}
        </select>
        <button
          style={{ padding: '8px 20px', backgroundColor: '#1a3328', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}
          onClick={() => {}}
        >
          검색
        </button>
      </div>

      {/* Table card */}
      <div style={{ backgroundColor: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
        {/* Table header row */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>공지 목록</span>
            <span style={{ color: '#9ca3af', fontSize: 12 }}>· 총 {totalCount}건</span>
            <span style={{ color: '#9ca3af', fontSize: 12 }}>·</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: pinFull ? '#d97706' : '#9ca3af', backgroundColor: pinFull ? '#fef3c7' : 'transparent', padding: pinFull ? '1px 6px' : '0', borderRadius: 4 }}>
              고정 {pinnedCount}/{PIN_LIMIT}
            </span>
            <span style={{ color: '#9ca3af', fontSize: 12 }}>· 게시중 <span style={{ color: '#15803d', fontWeight: 600 }}>{activeCount}</span></span>
            <span style={{ color: '#9ca3af', fontSize: 12 }}>· 숨김 <span style={{ color: '#6b7280', fontWeight: 600 }}>{hiddenCount}</span></span>
          </span>
          <button
            onClick={() => setDrawer({ notice: null, mode: 'create' })}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', backgroundColor: '#1a3328', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
            새 공지 작성
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ width: 44, padding: '10px 16px' }}>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} style={{ cursor: 'pointer' }} />
                </th>
                {['제목', '분류', '상태', '조회수', '게시일', ''].map((h, i) => (
                  <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap', borderBottom: '1px solid #f0f0f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(notice => {
                const isPinned = notice.pinned
                const cat = catStyle[notice.category] || catStyle['일반']
                return (
                  <tr
                    key={notice.id}
                    style={{ backgroundColor: isPinned ? '#fffbeb' : 'white', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                    onClick={() => setDrawer({ notice, mode: 'view' })}
                    onMouseEnter={e => { if (!isPinned) (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#fafafa' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = isPinned ? '#fffbeb' : 'white' }}
                  >
                    <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={checked.has(notice.id)} onChange={() => toggleOne(notice.id)} style={{ cursor: 'pointer' }} />
                    </td>
                    {/* Title */}
                    <td style={{ padding: '12px 14px', maxWidth: 340, minWidth: 220 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {notice.pinned && <span style={{ fontSize: 14 }}>📌</span>}
                        {notice.important && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', backgroundColor: '#fee2e2', padding: '1px 6px', borderRadius: 4 }}>중요</span>
                        )}
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{notice.title}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#b0b7c3', marginTop: 3 }}>{notice.id}</div>
                    </td>
                    {/* Category */}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{ backgroundColor: cat.bg, color: cat.color, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                        {notice.category}
                      </span>
                    </td>
                    {/* Status */}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <StatusDot status={notice.status} />
                    </td>
                    {/* Views */}
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>
                      {notice.views.toLocaleString()}
                    </td>
                    {/* Date */}
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {notice.date}
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setMenuOpen(menuOpen === notice.id ? null : notice.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px 8px', borderRadius: 6, fontSize: 18, lineHeight: 1 }}
                        >
                          ⋯
                        </button>
                        {menuOpen === notice.id && (
                          <div style={{ position: 'absolute', right: 0, top: '100%', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 10, minWidth: 100, overflow: 'hidden' }}>
                            {[
                              { label: '수정', action: () => { setDrawer({ notice, mode: 'edit' }); setMenuOpen(null) } },
                              { label: '숨김', action: () => { setNotices(notices.map(n => n.id === notice.id ? { ...n, status: 'HIDDEN' } : n)); setMenuOpen(null) } },
                              { label: '삭제', action: () => { handleDelete(notice.id); setMenuOpen(null) }, danger: true },
                            ].map(item => (
                              <button
                                key={item.label}
                                onClick={item.action}
                                style={{ display: 'block', width: '100%', padding: '9px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: (item as any).danger ? '#ef4444' : '#374151' }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setMenuOpen(null)} />
      )}
    </div>
  )
}
