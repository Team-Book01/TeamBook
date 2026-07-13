import { useState, useEffect } from 'react'
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

const catColors: Record<string, { bg: string; color: string }> = {
  일반: { bg: '#f3f4f6', color: '#6b7280' },
  이벤트: { bg: '#ede9fe', color: '#7c3aed' },
  업데이트: { bg: '#dbeafe', color: '#1d4ed8' },
  점검: { bg: '#ffedd5', color: '#c2410c' },
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

  const cat = catColors[form.category] || catColors['일반']

  return (
    <>
      {/* Dim */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 40, backdropFilter: 'blur(1px)' }}
      />
      {/* Drawer */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '40%', backgroundColor: 'white',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
          zIndex: 50, display: 'flex', flexDirection: 'column',
          animation: 'slideInRight 0.22s ease-out',
        }}
      >
        <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        {/* Drawer header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ backgroundColor: cat.bg, color: cat.color, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
            {form.category}
          </span>
          {mode === 'view' && notice && (
            <span style={{
              backgroundColor: notice.status === 'ACTIVE' ? '#dcfce7' : notice.status === 'HIDDEN' ? '#f3f4f6' : '#fee2e2',
              color: notice.status === 'ACTIVE' ? '#15803d' : notice.status === 'HIDDEN' ? '#6b7280' : '#dc2626',
              fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20
            }}>
              {notice.status}
            </span>
          )}
          <div style={{ flex: 1 }} />
          <span style={{ color: '#6b7280', fontSize: 13 }}>
            {mode === 'create' ? '새 공지 작성' : mode === 'edit' ? '공지 수정' : '공지 상세'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, borderRadius: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {mode === 'view' && notice ? (
            <ViewContent notice={notice} />
          ) : (
            <EditForm form={form} setForm={setForm} />
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', flexShrink: 0 }}>
          {mode === 'view' ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setMode('edit')}
                style={{ flex: 1, padding: '10px 0', backgroundColor: '#1a3328', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                수정
              </button>
              {onDelete && notice && (
                <button
                  onClick={() => { onDelete(notice.id); onClose() }}
                  style={{ padding: '10px 18px', backgroundColor: 'white', color: '#ef4444', border: '1.5px solid #ef4444', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                >
                  삭제
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => onSave({ ...form, draft: true } as Partial<Notice>)}
                  style={{ flex: 1, padding: '10px 0', backgroundColor: 'white', color: '#6b7280', border: '1.5px solid #d1d5db', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                >
                  임시저장
                </button>
                {mode === 'edit' && onDelete && notice && (
                  <button
                    onClick={() => { onDelete(notice.id); onClose() }}
                    style={{ padding: '10px 18px', backgroundColor: 'white', color: '#ef4444', border: '1.5px solid #ef4444', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                  >
                    삭제
                  </button>
                )}
              </div>
              <button
                onClick={() => { onSave(form as Partial<Notice>); onClose() }}
                style={{ width: '100%', padding: '11px 0', backgroundColor: '#1a3328', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
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
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {notice.pinned && <span style={{ fontSize: 12, color: '#92400e', backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>📌 상단 고정</span>}
        {notice.important && <span style={{ fontSize: 12, color: '#dc2626', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>중요</span>}
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16, lineHeight: 1.4 }}>{notice.title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { label: '조회수', value: notice.views.toLocaleString() + '회' },
          { label: '작성자', value: notice.author },
          { label: '게시일', value: notice.date },
          { label: '상태', value: notice.status },
        ].map(({ label, value }) => (
          <div key={label} style={{ backgroundColor: '#f9fafb', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ color: '#9ca3af', fontSize: 11, marginBottom: 3 }}>{label}</div>
            <div style={{ color: '#111827', fontSize: 13, fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
        <div style={{ color: '#374151', fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{notice.content}</div>
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
  const selectStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb',
    fontSize: 14, color: '#374151', backgroundColor: 'white', outline: 'none', cursor: 'pointer',
  }
  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb',
    fontSize: 14, color: '#374151', backgroundColor: 'white', outline: 'none', boxSizing: 'border-box' as const,
  }
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase' as const, letterSpacing: '0.03em' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <label style={labelStyle}>분류</label>
        <select style={selectStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>제목</label>
        <input
          style={inputStyle}
          placeholder="공지 제목을 입력하세요"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div>
        <label style={labelStyle}>본문</label>
        <div style={{ border: '1.5px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', padding: '6px 10px', display: 'flex', gap: 8 }}>
            {['B', 'I', 'U', '≡', '·'].map(t => (
              <button key={t} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 4, width: 26, height: 26, cursor: 'pointer', fontSize: 12, fontWeight: t === 'B' ? 700 : 400, color: '#6b7280' }}>{t}</button>
            ))}
          </div>
          <textarea
            style={{ width: '100%', minHeight: 180, padding: '12px', fontSize: 14, color: '#374151', border: 'none', resize: 'vertical', outline: 'none', lineHeight: 1.7, boxSizing: 'border-box' }}
            placeholder="공지 내용을 입력하세요..."
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
          />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={labelStyle}>옵션</label>
        {[
          { key: 'pinned' as const, label: '상단 고정', desc: '목록 최상단에 고정됩니다' },
          { key: 'important' as const, label: '중요 공지', desc: '제목에 빨강 "중요" 배지가 표시됩니다' },
        ].map(({ key, label, desc }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#f9fafb', borderRadius: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>{desc}</div>
            </div>
            <div
              onClick={() => setForm({ ...form, [key]: !form[key] })}
              style={{
                width: 42, height: 24, borderRadius: 12,
                backgroundColor: form[key] ? '#1a3328' : '#d1d5db',
                position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
              }}
            >
              <div style={{
                position: 'absolute', top: 3, left: form[key] ? 20 : 3,
                width: 18, height: 18, borderRadius: '50%', backgroundColor: 'white',
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
          </div>
        ))}
      </div>
      <div>
        <label style={labelStyle}>상태</label>
        <select style={selectStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'ACTIVE' | 'HIDDEN' })}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
    </div>
  )
}
