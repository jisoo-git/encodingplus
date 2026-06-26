import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

interface Submission {
  id: string
  name: string
  course: string
  school: string
  phone: string
  status: 'new' | 'confirmed' | 'done'
  submittedAt: { toDate: () => Date } | null
  detail: Record<string, string>
}

const STATUS_LABEL: Record<string, string> = {
  new: '새 신청',
  confirmed: '확인완료',
  done: '상담완료',
}
const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  new: { bg: '#fef9c3', text: '#a16207' },
  confirmed: { bg: '#dbeafe', text: '#1d4ed8' },
  done: { bg: '#dcfce7', text: '#15803d' },
}

const FILTER_TABS = ['전체', '새 신청', '확인완료', '상담완료']
const FILTER_MAP: Record<string, string | null> = {
  '전체': null,
  '새 신청': 'new',
  '확인완료': 'confirmed',
  '상담완료': 'done',
}


function formatDate(sub: Submission) {
  if (!sub.submittedAt) return '—'
  try {
    const d = sub.submittedAt.toDate()
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  } catch {
    return '—'
  }
}


export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('전체')
  const [selected, setSelected] = useState<Submission | null>(null)
  const [updating, setUpdating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  // questionId → label 매핑 (기존 UUID 키 데이터 처리용)
  const [labelMap, setLabelMap] = useState<Record<string, string>>({})

  async function fetchSubmissions() {
    try {
      const q = query(collection(db, 'submissions'), orderBy('submittedAt', 'desc'))
      const snap = await getDocs(q)
      setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission)))
    } catch {
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchLabelMap() {
    try {
      const snap = await getDocs(collection(db, 'forms'))
      const map: Record<string, string> = {}
      snap.docs.forEach(d => {
        const sections = (d.data().sections ?? []) as { questions: { id: string; label: string }[] }[]
        sections.forEach(s => s.questions.forEach(q => { if (q.id && q.label) map[q.id] = q.label }))
      })
      setLabelMap(map)
    } catch {}
  }

  useEffect(() => { fetchSubmissions(); fetchLabelMap() }, [])

  const filterKey = FILTER_MAP[filter]
  const filtered = filterKey ? submissions.filter(s => s.status === filterKey) : submissions

  const counts = {
    total: submissions.length,
    new: submissions.filter(s => s.status === 'new').length,
    confirmed: submissions.filter(s => s.status === 'confirmed').length,
    done: submissions.filter(s => s.status === 'done').length,
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  async function updateStatus(id: string, status: Submission['status']) {
    setUpdating(true)
    try {
      await updateDoc(doc(db, 'submissions', id), { status })
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s))
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : prev)
      showToast(`${STATUS_LABEL[status]}(으)로 변경되었습니다`)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div style={{ padding: '24px 18px 80px', display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - 56px)' }} className="md:max-w-[1100px] md:mx-auto">

      {/* 페이지 제목 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ width: 28, height: 3, background: '#2563eb', borderRadius: 999, marginBottom: 10 }} />
        <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', letterSpacing: '0.06em' }}>ADMIN</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#18181b', marginTop: 2 }}>신청현황</div>
      </div>

      {/* 요약 카드 */}
      <div style={{ marginBottom: 12, background: '#fff', border: '1px solid #c8d0dc', borderRadius: 14, padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { label: '전체', value: counts.total, color: '#18181b' },
            { label: '새 신청', value: counts.new, color: '#a16207' },
            { label: '확인완료', value: counts.confirmed, color: '#1d4ed8' },
            { label: '상담완료', value: counts.done, color: '#15803d' },
          ].map(s => (
            <div key={s.label} style={{ background: '#f4f4f6', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#71717a', marginTop: 4, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 필터 탭 + 목록 섹션 */}
      <div style={{ flex: 1, background: '#fff', border: '1px solid #c8d0dc', borderRadius: 14, padding: '16px', display: 'flex', flexDirection: 'column' }}>
        {/* 필터 탭 */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14 }}>
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '7px 14px',
                borderRadius: 20,
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                background: filter === tab ? '#2563eb' : '#f4f4f6',
                color: filter === tab ? '#fff' : '#52525b',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 목록 */}
        <div style={{ flex: 1 }}>
        {loading ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#8c959f', fontSize: 14 }}>불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#8c959f', fontSize: 14 }}>신청 내역이 없습니다</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(sub => {
              const sc = STATUS_COLOR[sub.status] ?? STATUS_COLOR.new
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelected(sub)}
                  style={{
                    background: '#fff',
                    border: '1px solid #c8d0dc',
                    borderRadius: 14,
                    padding: '16px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  {/* 왼쪽: 이름 + 수업 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 16, color: '#18181b' }}>{sub.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.text, padding: '2px 7px', borderRadius: 6 }}>
                        {STATUS_LABEL[sub.status] ?? sub.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#52525b', fontWeight: 600, marginBottom: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {sub.course}
                    </div>
                    <div style={{ fontSize: 12, color: '#8c959f' }}>{sub.school} · {formatDate(sub)}</div>
                  </div>
                  {/* 오른쪽: 화살표 */}
                  <span style={{ color: '#d4d4d8', fontSize: 18 }}>›</span>
                </div>
              )
            })}
          </div>
        )}
        </div>
      </div>

      {/* 토스트 */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: '#18181b', color: '#fff',
          padding: '10px 20px', borderRadius: 10,
          fontSize: 13, fontWeight: 600, zIndex: 100,
          whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          {toast}
        </div>
      )}

      {/* ── 상세 Bottom Sheet ── */}
      {selected && (
        <div
          className="course-sheet-overlay"
          style={{ zIndex: 60 }}
          onClick={() => setSelected(null)}
        >
          <div
            className="course-sheet-panel"
            onClick={e => e.stopPropagation()}
          >
            {/* 핸들 */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#c8d0dc' }} />
            </div>

            <div style={{ padding: '8px 20px 28px' }}>
              {/* 헤더 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#18181b' }}>{selected.name}</div>
                  <div style={{ fontSize: 13, color: '#71717a', marginTop: 2 }}>{selected.school} · {formatDate(selected)}</div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: '#f4f4f6', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 13, color: '#52525b', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                >
                  닫기
                </button>
              </div>

              {/* 수업 + 상태 */}
              <div style={{ background: '#f4f4f6', borderRadius: 12, padding: '14px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#8c959f', fontWeight: 600, marginBottom: 3 }}>신청 수업</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#18181b' }}>{selected.course}</div>
                </div>
                {(() => {
                  const sc = STATUS_COLOR[selected.status] ?? STATUS_COLOR.new
                  return (
                    <span style={{ fontSize: 12, fontWeight: 700, background: sc.bg, color: sc.text, padding: '5px 10px', borderRadius: 8 }}>
                      {STATUS_LABEL[selected.status] ?? selected.status}
                    </span>
                  )
                })()}
              </div>

              {/* 상세 정보 */}
              {selected.detail && Object.keys(selected.detail).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20, border: '1px solid #c8d0dc', borderRadius: 12, overflow: 'hidden' }}>
                  {Object.entries(selected.detail).map(([key, val], i, arr) => {
                    const label = labelMap[key] ?? key
                    return (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          padding: '12px 16px',
                          borderBottom: i < arr.length - 1 ? '1px solid #f4f4f6' : 'none',
                          background: '#fff',
                          gap: 12,
                        }}
                      >
                        <div style={{ minWidth: 130, fontSize: 13, color: '#71717a', fontWeight: 600, flexShrink: 0 }}>{label}</div>
                        <div style={{ fontSize: 13, color: '#18181b', fontWeight: 500, wordBreak: 'break-all' }}>{String(val)}</div>
                      </div>
                    )
                  })}
                </div>
              )}
              {(!selected.detail || Object.keys(selected.detail).length === 0) && (
                <div style={{ marginBottom: 20, padding: '16px', background: '#f4f4f6', borderRadius: 12, fontSize: 13, color: '#8c959f', textAlign: 'center' }}>
                  상세 응답 없음
                </div>
              )}

              {/* 상태 변경 버튼 */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: '#8c959f', fontWeight: 600, marginBottom: 10 }}>상태 변경</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['new', 'confirmed', 'done'] as const).map(s => {
                    const active = selected.status === s
                    return (
                      <button
                        key={s}
                        disabled={active || updating}
                        onClick={() => updateStatus(selected.id, s)}
                        style={{
                          flex: 1,
                          padding: '11px 0',
                          borderRadius: 10,
                          border: active ? '2px solid #18181b' : '1px solid #e5e5ea',
                          background: active ? '#18181b' : '#fff',
                          color: active ? '#fff' : '#52525b',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: active ? 'default' : 'pointer',
                          opacity: updating && !active ? 0.5 : 1,
                        }}
                      >
                        {STATUS_LABEL[s]}
                      </button>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
