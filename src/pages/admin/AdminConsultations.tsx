import { useState, useEffect, useCallback } from 'react'
import { fetchAll, fetchConfig, saveConfig, removeSlot, blockSlot, updateStatus } from '../../consult/api'
import { hoursForDate, ymd } from '../../consult/slots'
import { WEEKDAY_LABELS, type ConsultConfig, type ConsultDoc, type ConsultStatus } from '../../consult/types'

type Section = 'bookings' | 'blocks' | 'schedule'

const STATUS_META: Record<ConsultStatus, { label: string; color: string; bg: string }> = {
  new: { label: '새 예약', color: '#dc2626', bg: '#fef2f2' },
  confirmed: { label: '확인완료', color: '#2563eb', bg: '#dbeafe' },
  done: { label: '상담완료', color: '#16a34a', bg: '#f0fdf4' },
}
const STATUS_ORDER: ConsultStatus[] = ['new', 'confirmed', 'done']

function weekdayLabel(date: string) {
  return WEEKDAY_LABELS[new Date(`${date}T00:00:00`).getDay()]
}

export default function AdminConsultations() {
  const [section, setSection] = useState<Section>('bookings')
  const [docs, setDocs] = useState<ConsultDoc[]>([])
  const [config, setConfig] = useState<ConsultConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const [blockDate, setBlockDate] = useState<string>(() => ymd(new Date()))
  const [savingSchedule, setSavingSchedule] = useState(false)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200) }

  const reload = useCallback(async () => {
    setLoading(true)
    const [all, cfg] = await Promise.all([fetchAll(), fetchConfig()])
    setDocs(all)
    setConfig(prev => prev ?? cfg) // 편집 중 스케줄 덮어쓰기 방지
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  const bookings = docs.filter(d => d.kind === 'booking')
  const blocks = docs.filter(d => d.kind === 'block')

  // 날짜별 그룹 (예약) — 날짜·시간 오름차순
  const byDate = new Map<string, ConsultDoc[]>()
  for (const b of [...bookings].sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour)) {
    if (!byDate.has(b.date)) byDate.set(b.date, [])
    byDate.get(b.date)!.push(b)
  }

  const handleCancel = async (id: string) => {
    await removeSlot(id)
    setDocs(prev => prev.filter(d => d.id !== id))
    flash('예약을 취소했습니다')
  }
  const handleStatus = async (id: string, status: ConsultStatus) => {
    await updateStatus(id, status)
    setDocs(prev => prev.map(d => d.id === id ? { ...d, status } : d))
  }

  // ── 시간 차단 ──
  const blockHours = config ? hoursForDate(config, blockDate) : []
  const dayDocs = docs.filter(d => d.date === blockDate)
  const docAt = (hour: number) => dayDocs.find(d => d.hour === hour)

  const toggleBlock = async (hour: number) => {
    const existing = docAt(hour)
    if (existing?.kind === 'booking') return // 예약된 슬롯은 예약목록에서 취소
    if (existing?.kind === 'block') {
      await removeSlot(existing.id)
      setDocs(prev => prev.filter(d => d.id !== existing.id))
      flash('차단을 해제했습니다')
    } else {
      try {
        const id = await blockSlot(blockDate, hour)
        setDocs(prev => [...prev, { id, kind: 'block', date: blockDate, hour }])
        flash('해당 시간을 차단했습니다')
      } catch {
        flash('이미 점유된 시간입니다')
        reload()
      }
    }
  }

  // ── 스케줄 저장 ──
  const setDay = (wd: number, patch: Partial<ConsultConfig['weekly'][number]>) => {
    setConfig(c => c ? { ...c, weekly: { ...c.weekly, [wd]: { ...c.weekly[wd], ...patch } } } : c)
  }
  const handleSaveSchedule = async () => {
    if (!config) return
    setSavingSchedule(true)
    try {
      await saveConfig(config)
      flash('스케줄을 저장했습니다')
    } catch {
      flash('저장 중 오류가 발생했습니다')
    } finally {
      setSavingSchedule(false)
    }
  }

  const tabBtn = (key: Section, label: string) => (
    <button onClick={() => setSection(key)}
      style={{
        flex: 1, padding: '10px 8px', borderRadius: 9, border: 'none', cursor: 'pointer',
        background: section === key ? '#dbeafe' : '#f4f4f5',
        color: section === key ? '#1d4ed8' : '#71717a',
        fontSize: 14, fontWeight: section === key ? 700 : 500,
      }}>{label}</button>
  )

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 40px' }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#18181b', marginBottom: 16 }}>상담 예약 관리</div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {tabBtn('bookings', '예약 목록')}
        {tabBtn('blocks', '시간 차단')}
        {tabBtn('schedule', '스케줄 설정')}
      </div>

      {loading && <div style={{ padding: '40px 0', textAlign: 'center', color: '#8c959f', fontSize: 14 }}>불러오는 중...</div>}

      {/* ── 예약 목록 ── */}
      {!loading && section === 'bookings' && (
        byDate.size === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#71717a', fontSize: 14, background: '#f9fafb', borderRadius: 12 }}>아직 예약이 없습니다.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[...byDate.entries()].map(([date, list]) => (
              <div key={date}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8', marginBottom: 8 }}>
                  {date} ({weekdayLabel(date)}) · {list.length}건
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {list.map(b => {
                    const meta = STATUS_META[b.status ?? 'new']
                    return (
                      <div key={b.id} style={{ border: '1px solid #e4e4e7', borderRadius: 12, padding: 14, background: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 16, fontWeight: 800, color: '#18181b' }}>{b.hour}시</span>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#3f3f46' }}>{b.name}</span>
                            <a href={`tel:${b.phone}`} style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none' }}>{b.phone}</a>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, background: meta.bg, padding: '3px 8px', borderRadius: 6 }}>{meta.label}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {STATUS_ORDER.map(s => (
                            <button key={s} onClick={() => handleStatus(b.id, s)}
                              style={{
                                padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                border: (b.status ?? 'new') === s ? `1px solid ${STATUS_META[s].color}` : '1px solid #d4d4d8',
                                background: (b.status ?? 'new') === s ? STATUS_META[s].bg : '#fff',
                                color: (b.status ?? 'new') === s ? STATUS_META[s].color : '#71717a',
                              }}>{STATUS_META[s].label}</button>
                          ))}
                          <button onClick={() => handleCancel(b.id)}
                            style={{ marginLeft: 'auto', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid #fecaca', background: '#fff', color: '#dc2626', cursor: 'pointer' }}>
                            예약 취소
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── 시간 차단 ── */}
      {!loading && section === 'blocks' && config && (
        <div>
          <div style={{ fontSize: 13, color: '#71717a', marginBottom: 12, lineHeight: 1.6 }}>
            휴무·마감할 시간을 눌러 차단하세요. 차단된 시간은 사용자 예약 화면에서 선택할 수 없습니다.
          </div>
          <input type="date" value={blockDate} min={ymd(new Date())} onChange={e => setBlockDate(e.target.value)}
            style={{ border: '1px solid #c8d0dc', borderRadius: 10, padding: '10px 12px', fontSize: 15, marginBottom: 16, fontFamily: 'inherit' }} />

          {blockHours.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#71717a', fontSize: 13, background: '#f9fafb', borderRadius: 12 }}>
              이 요일은 스케줄상 휴무입니다. (스케줄 설정에서 변경 가능)
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {blockHours.map(h => {
                const d = docAt(h)
                const booked = d?.kind === 'booking'
                const blocked = d?.kind === 'block'
                return (
                  <button key={h} onClick={() => toggleBlock(h)} disabled={booked}
                    style={{
                      padding: '12px 4px', borderRadius: 10, cursor: booked ? 'not-allowed' : 'pointer',
                      border: blocked ? '2px solid #dc2626' : booked ? '1px solid #d4d4d8' : '1px solid #c8d0dc',
                      background: blocked ? '#fef2f2' : booked ? '#f4f4f5' : '#fff',
                      color: blocked ? '#dc2626' : booked ? '#a1a1aa' : '#3f3f46',
                      fontSize: 14, fontWeight: 700,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    }}>
                    <span>{h}시</span>
                    <span style={{ fontSize: 10, fontWeight: 600 }}>{blocked ? '차단됨' : booked ? '예약' : '열림'}</span>
                  </button>
                )
              })}
            </div>
          )}

          {blocks.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#52525b', marginBottom: 8 }}>차단된 시간 전체</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[...blocks].sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour).map(b => (
                  <button key={b.id} onClick={() => { removeSlot(b.id); setDocs(prev => prev.filter(d => d.id !== b.id)); flash('차단을 해제했습니다') }}
                    style={{ padding: '7px 12px', borderRadius: 999, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {b.date} {b.hour}시 ✕
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 스케줄 설정 ── */}
      {!loading && section === 'schedule' && config && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: 14, border: '1px solid #e4e4e7', borderRadius: 12 }}>
            <input type="checkbox" checked={config.enabled} onChange={e => setConfig(c => c ? { ...c, enabled: e.target.checked } : c)} style={{ width: 18, height: 18 }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#3f3f46' }}>상담 예약 오픈 (끄면 사용자 화면에 "준비 중" 표시)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#3f3f46' }}>예약 가능 범위</span>
            <input type="number" min={1} max={90} value={config.advanceDays}
              onChange={e => setConfig(c => c ? { ...c, advanceDays: Math.max(1, Number(e.target.value) || 1) } : c)}
              style={{ width: 70, border: '1px solid #c8d0dc', borderRadius: 8, padding: '8px 10px', fontSize: 14, fontFamily: 'inherit' }} />
            <span style={{ fontSize: 14, color: '#71717a' }}>일 앞까지</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {[0, 1, 2, 3, 4, 5, 6].map(wd => {
              const day = config.weekly[wd]
              return (
                <div key={wd} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid #e4e4e7', borderRadius: 10, background: day.open ? '#fff' : '#f9fafb' }}>
                  <button onClick={() => setDay(wd, { open: !day.open })}
                    style={{ width: 40, fontSize: 15, fontWeight: 800, color: day.open ? '#1d4ed8' : '#a1a1aa', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {WEEKDAY_LABELS[wd]}
                  </button>
                  {day.open ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#3f3f46' }}>
                      <input type="number" min={0} max={23} value={day.start}
                        onChange={e => setDay(wd, { start: Math.min(23, Math.max(0, Number(e.target.value) || 0)) })}
                        style={{ width: 56, border: '1px solid #c8d0dc', borderRadius: 8, padding: '6px 8px', fontSize: 14, fontFamily: 'inherit' }} />
                      <span>시 ~</span>
                      <input type="number" min={1} max={24} value={day.end}
                        onChange={e => setDay(wd, { end: Math.min(24, Math.max(1, Number(e.target.value) || 1)) })}
                        style={{ width: 56, border: '1px solid #c8d0dc', borderRadius: 8, padding: '6px 8px', fontSize: 14, fontFamily: 'inherit' }} />
                      <span>시</span>
                    </div>
                  ) : (
                    <button onClick={() => setDay(wd, { open: true })} style={{ fontSize: 13, color: '#a1a1aa', background: 'none', border: 'none', cursor: 'pointer' }}>휴무 (탭하여 열기)</button>
                  )}
                </div>
              )
            })}
          </div>

          <button onClick={handleSaveSchedule} disabled={savingSchedule}
            style={{ width: '100%', padding: '13px 0', border: 'none', borderRadius: 11, background: '#2563eb', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            {savingSchedule ? '저장 중...' : '스케줄 저장'}
          </button>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)', background: '#18181b', color: '#fff', padding: '10px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600, zIndex: 100 }}>
          {toast}
        </div>
      )}
    </div>
  )
}
