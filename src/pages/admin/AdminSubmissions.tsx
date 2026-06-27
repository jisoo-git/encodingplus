import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

interface Submission {
  id: string
  name?: string
  course?: string
  school?: string
  phone?: string
  formTitle?: string
  formId?: string
  status: 'new' | 'confirmed' | 'done'
  submittedAt: { toDate: () => Date } | null
  detail: Record<string, string>
}

const STATUS_LABEL: Record<string, string> = {
  new: '새 신청',
  confirmed: '확인완료',
  done: '상담완료',
}
const STATUS_COLOR: Record<string, { bg: string; text: string; bar: string }> = {
  new:       { bg: '#fef9c3', text: '#a16207', bar: '#f59e0b' },
  confirmed: { bg: '#dbeafe', text: '#1d4ed8', bar: '#2563eb' },
  done:      { bg: '#dcfce7', text: '#15803d', bar: '#22c55e' },
}

const STATUS_TABS = ['전체', '새 신청', '확인완료', '상담완료']
const STATUS_MAP: Record<string, string | null> = {
  '전체': null, '새 신청': 'new', '확인완료': 'confirmed', '상담완료': 'done',
}

function formatDate(sub: Submission) {
  if (!sub.submittedAt) return '—'
  try {
    const d = sub.submittedAt.toDate()
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  } catch { return '—' }
}

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('전체')
  const [formFilter, setFormFilter] = useState<string | null>(null)
  const [formList, setFormList] = useState<{ id: string; title: string }[]>([])
  const [selected, setSelected] = useState<Submission | null>(null)
  const [updating, setUpdating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [labelMap, setLabelMap] = useState<Record<string, string>>({})

  async function fetchSubmissions() {
    try {
      const snap = await getDocs(query(collection(db, 'submissions'), orderBy('submittedAt', 'desc')))
      setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission)))
    } catch { setSubmissions([]) }
    finally { setLoading(false) }
  }

  async function fetchForms() {
    try {
      const snap = await getDocs(collection(db, 'forms'))
      const map: Record<string, string> = {}
      const list: { id: string; title: string }[] = []
      snap.docs.forEach(d => {
        const data = d.data()
        list.push({ id: d.id, title: (data.title as string) || '제목 없음' })
        const sections = (data.sections ?? []) as { questions: { id: string; label: string }[] }[]
        sections.forEach(s => s.questions.forEach(q => { if (q.id && q.label) map[q.id] = q.label }))
      })
      setFormList(list)
      setLabelMap(map)
    } catch {}
  }

  useEffect(() => { fetchSubmissions(); fetchForms() }, [])

  async function updateStatus(id: string, status: Submission['status']) {
    setUpdating(true)
    try {
      await updateDoc(doc(db, 'submissions', id), { status })
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s))
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : prev)
      setToast(`${STATUS_LABEL[status]}(으)로 변경되었습니다`)
      setTimeout(() => setToast(null), 2000)
    } finally { setUpdating(false) }
  }

  const statusKey = STATUS_MAP[statusFilter]
  // 폼 필터 기준 서브셋 (상태 탭·카운트 모두 이 기준)
  const formFiltered = submissions.filter(s => !formFilter || s.formId === formFilter)
  const filtered = formFiltered.filter(s => !statusKey || s.status === statusKey)

  const counts = {
    new:       formFiltered.filter(s => s.status === 'new').length,
    confirmed: formFiltered.filter(s => s.status === 'confirmed').length,
    done:      formFiltered.filter(s => s.status === 'done').length,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - 56px)', background: '#f8f9fb' }} className="md:max-w-[1100px] md:mx-auto">

      {/* 헤더 */}
      <div style={{ padding: '20px 18px 0', background: '#fff', borderBottom: '1px solid #e8eaed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ width: 28, height: 3, background: '#2563eb', borderRadius: 999, marginBottom: 10 }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', letterSpacing: '0.06em' }}>SUBMISSIONS</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#18181b', marginTop: 2 }}>신청현황</div>
          </div>
          {/* 요약 카운트 */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', paddingTop: 6 }}>
            {[
              { label: '새 신청', value: counts.new, color: '#a16207', bg: '#fef9c3' },
              { label: '확인완료', value: counts.confirmed, color: '#1d4ed8', bg: '#dbeafe' },
              { label: '상담완료', value: counts.done, color: '#15803d', bg: '#dcfce7' },
            ].map(c => (
              <div key={c.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.value}</div>
                <div style={{ fontSize: 10, color: '#8c959f', marginTop: 2, fontWeight: 600 }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 폼 필터 pills */}
        {formList.length > 1 && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10 }}>
            <button onClick={() => setFormFilter(null)} style={{ padding: '4px 12px', borderRadius: 999, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', background: formFilter === null ? '#18181b' : '#f0f0f2', color: formFilter === null ? '#fff' : '#52525b' }}>전체</button>
            {formList.map(f => (
              <button key={f.id} onClick={() => setFormFilter(f.id)} style={{ padding: '4px 12px', borderRadius: 999, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', background: formFilter === f.id ? '#2563eb' : '#f0f0f2', color: formFilter === f.id ? '#fff' : '#52525b' }}>{f.title}</button>
            ))}
          </div>
        )}

        {/* 상태 탭 */}
        <div style={{ display: 'flex', gap: 0 }}>
          {STATUS_TABS.map(tab => {
            const key = STATUS_MAP[tab]
            const cnt = key ? counts[key as keyof typeof counts] : formFiltered.length
            return (
              <button key={tab} onClick={() => setStatusFilter(tab)} style={{
                flex: 1, padding: '10px 4px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                color: statusFilter === tab ? '#2563eb' : '#8c959f',
                borderBottom: statusFilter === tab ? '2px solid #2563eb' : '2px solid transparent',
              }}>
                {tab}<span style={{ fontSize: 11, marginLeft: 3, opacity: 0.75 }}>{cnt}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 목록 */}
      <div style={{ flex: 1, padding: '0 0 80px' }}>
        {loading ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#8c959f', fontSize: 14 }}>불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#8c959f', fontSize: 14 }}>신청 내역이 없습니다</div>
        ) : (
          <div style={{ background: '#fff' }}>
            {filtered.map((sub, i) => {
              const sc = STATUS_COLOR[sub.status] ?? STATUS_COLOR.new
              const detailName = Object.entries(sub.detail || {}).find(([k]) => ['이름', '성명'].some(kw => k.includes(kw)))?.[1] as string | undefined
              const displayName = sub.name || detailName || '—'
              const displaySub = sub.course || sub.formTitle || ''
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelected(sub)}
                  className="submission-row"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 18px',
                    borderBottom: i < filtered.length - 1 ? '1px solid #f0f0f2' : 'none',
                    borderLeft: `3px solid ${sc.bar}`,
                    cursor: 'pointer',
                    background: '#fff',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#18181b' }}>{displayName}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.text, padding: '2px 8px', borderRadius: 6, flexShrink: 0, marginLeft: 8 }}>
                        {STATUS_LABEL[sub.status]}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#71717a', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{displaySub}</span>
                      <span style={{ fontSize: 11, color: '#b0b8c1', flexShrink: 0, marginLeft: 8 }}>{formatDate(sub)}</span>
                    </div>
                  </div>
                  <span style={{ color: '#d4d4d8', fontSize: 16, flexShrink: 0 }}>›</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 토스트 */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#18181b', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 100, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
          {toast}
        </div>
      )}

      <style>{`.submission-row:hover { background: #f6f9fc !important; }`}</style>

      {/* 상세 Bottom Sheet */}
      {selected && (
        <div className="course-sheet-overlay" style={{ zIndex: 60 }} onClick={() => setSelected(null)}>
          <div className="course-sheet-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#c8d0dc' }} />
            </div>

            <div style={{ padding: '8px 20px 32px', overflowY: 'auto', maxHeight: '70vh' }}>
              {/* 헤더 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 19, fontWeight: 800, color: '#18181b' }}>{selected.name || selected.formTitle || '—'}</div>
                  <div style={{ fontSize: 13, color: '#8c959f', marginTop: 3 }}>
                    {[selected.school, formatDate(selected)].filter(Boolean).join(' · ')}
                  </div>
                  {selected.phone && (
                    <a href={`tel:${selected.phone}`} style={{ fontSize: 14, fontWeight: 700, color: '#2563eb', textDecoration: 'none', display: 'block', marginTop: 4 }}>
                      {selected.phone}
                    </a>
                  )}
                </div>
                <button onClick={() => setSelected(null)} style={{ background: '#f4f4f6', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 13, color: '#52525b', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>닫기</button>
              </div>

              {/* 폼/수업 + 상태 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '12px 14px', background: '#f8f9fb', borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#8c959f', fontWeight: 600, marginBottom: 2 }}>{selected.course ? '신청 수업' : '폼 종류'}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#18181b' }}>{selected.course || selected.formTitle || '—'}</div>
                </div>
                {(() => {
                  const sc = STATUS_COLOR[selected.status] ?? STATUS_COLOR.new
                  return <span style={{ fontSize: 12, fontWeight: 700, background: sc.bg, color: sc.text, padding: '5px 10px', borderRadius: 8 }}>{STATUS_LABEL[selected.status]}</span>
                })()}
              </div>

              {/* 상세 응답 */}
              {selected.detail && Object.keys(selected.detail).length > 0 ? (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#8c959f', letterSpacing: '0.06em', marginBottom: 8 }}>응답 내용</div>
                  <div style={{ border: '1px solid #e8eaed', borderRadius: 10, overflow: 'hidden', display: 'grid', gridTemplateColumns: 'auto 1fr' }}>
                    {Object.entries(selected.detail).flatMap(([key, val], i, arr) => {
                      const label = labelMap[key] ?? key
                      const isLast = i === arr.length - 1
                      return [
                        <div key={`${key}-l`} style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#71717a', background: '#f8f9fa', borderRight: '1px solid #e8eaed', borderBottom: isLast ? 'none' : '1px solid #f0f0f2', whiteSpace: 'nowrap' }}>{label}</div>,
                        <div key={`${key}-v`} style={{ padding: '10px 12px', fontSize: 13, fontWeight: 500, color: '#18181b', wordBreak: 'break-word', borderBottom: isLast ? 'none' : '1px solid #f0f0f2' }}>{String(val)}</div>,
                      ]
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 20, padding: '14px', background: '#f8f9fb', borderRadius: 10, fontSize: 13, color: '#8c959f', textAlign: 'center' }}>상세 응답 없음</div>
              )}

              {/* 상태 변경 */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#8c959f', letterSpacing: '0.06em', marginBottom: 8 }}>상태 변경</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['new', 'confirmed', 'done'] as const).map(s => {
                    const active = selected.status === s
                    const sc = STATUS_COLOR[s]
                    return (
                      <button key={s} disabled={active || updating} onClick={() => updateStatus(selected.id, s)} style={{
                        flex: 1, padding: '10px 0', borderRadius: 10, cursor: active ? 'default' : 'pointer',
                        border: active ? `2px solid ${sc.bar}` : '1px solid #e5e5ea',
                        background: active ? sc.bg : '#fff',
                        color: active ? sc.text : '#52525b',
                        fontSize: 13, fontWeight: 700,
                        opacity: updating && !active ? 0.5 : 1,
                      }}>{STATUS_LABEL[s]}</button>
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
