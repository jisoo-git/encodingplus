import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { fetchConfig, fetchDayDocs, bookSlot } from '../consult/api'
import { dateStrip, hoursForDate, isBookable, ymd, type DateOption } from '../consult/slots'
import { WEEKDAY_LABELS, type ConsultConfig } from '../consult/types'
import { notifySubmissionCreated } from '../lib/discordNotifications'

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid #c8d0dc', borderRadius: 10,
  padding: '12px 14px', fontSize: 15, outline: 'none',
  background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit',
}

const GRADE_OPTIONS = ['초6 미만', '초6', '중1', '중2', '중3', '고1', '고2', '고3', '기타']

function mdLabel(date: string) {
  const [, m, d] = date.split('-')
  return `${Number(m)}/${Number(d)}`
}

export default function Consult() {
  const navigate = useNavigate()

  const [config, setConfig] = useState<ConsultConfig | null>(null)
  const [dates, setDates] = useState<DateOption[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const [taken, setTaken] = useState<Set<number>>(new Set())
  const [now, setNow] = useState<Date>(() => new Date())
  const [slotsLoading, setSlotsLoading] = useState(false)

  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('')
  const [phone, setPhone] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [configLoading, setConfigLoading] = useState(true)

  // 설정 로드 → 날짜 스트립 구성
  useEffect(() => {
    let alive = true
    ;(async () => {
      const cfg = await fetchConfig()
      if (!alive) return
      setConfig(cfg)
      const strip = dateStrip(cfg, new Date())
      setDates(strip)
      setSelectedDate(strip[0]?.date ?? null)
      setConfigLoading(false)
    })()
    return () => { alive = false }
  }, [])

  // 선택 날짜의 점유 슬롯 로드
  const loadDay = useCallback(async (date: string) => {
    setSlotsLoading(true)
    try {
      const docs = await fetchDayDocs(date)
      setTaken(new Set(docs.map(d => d.hour)))
      setNow(new Date())
    } finally {
      setSlotsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedDate) return
    setSelectedHour(null)
    loadDay(selectedDate)
  }, [selectedDate, loadDay])

  const hours = config && selectedDate ? hoursForDate(config, selectedDate) : []

  // 캘린더 disable 매처 계산
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayStr = ymd(startToday)
  const todayBookable = !!config && hoursForDate(config, todayStr).some(h => isBookable(todayStr, h, now))
  const minDate = todayBookable ? startToday : new Date(startToday.getFullYear(), startToday.getMonth(), startToday.getDate() + 1)
  const maxDate = config
    ? new Date(startToday.getFullYear(), startToday.getMonth(), startToday.getDate() + config.advanceDays)
    : startToday
  const closedWeekdays = config
    ? [0, 1, 2, 3, 4, 5, 6].filter(wd => { const s = config.weekly[wd]; return !s || !s.open || s.start >= s.end })
    : []
  const selectedDateObj = selectedDate ? new Date(`${selectedDate}T00:00:00`) : undefined

  const canSubmit =
    !!selectedDate && selectedHour !== null &&
    name.trim() !== '' && grade !== '' && phone.trim() !== '' && !submitting

  const handleSubmit = async () => {
    if (!selectedDate || selectedHour === null) return
    setSubmitting(true)
    setNotice(null)
    try {
      await bookSlot({ date: selectedDate, hour: selectedHour, name, phone, grade })
      await notifySubmissionCreated({
        kind: 'consultation',
        title: '\uC0C1\uB2F4 \uC608\uC57D',
        name,
        phone,
        grade,
        date: selectedDate,
        hour: selectedHour,
      })
      setSubmitted(true)
    } catch (e) {
      if (e instanceof Error && e.message === 'SLOT_TAKEN') {
        setNotice('방금 다른 분이 예약했어요. 다른 시간을 선택해주세요.')
        setSelectedHour(null)
        loadDay(selectedDate)
      } else {
        setNotice('예약 중 오류가 발생했습니다. 다시 시도해주세요.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="md:max-w-[680px] md:mx-auto md:px-7">
        <div style={{ padding: '20px 18px 24px' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#18181b', marginBottom: 20 }}>상담 예약</div>

          {configLoading && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#8c959f', fontSize: 14 }}>불러오는 중...</div>
          )}

          {!configLoading && config && !config.enabled && (
            <div style={{ padding: '40px 20px', textAlign: 'center', background: '#fff', borderRadius: 14, border: '1px solid #c8d0dc' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#18181b', marginBottom: 8 }}>상담 예약 준비 중입니다</div>
              <div style={{ fontSize: 13, color: '#71717a' }}>곧 오픈될 예정입니다. 문의: 010-2838-2391</div>
            </div>
          )}

          {!configLoading && config && config.enabled && dates.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', background: '#fff', borderRadius: 14, border: '1px solid #c8d0dc' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#18181b', marginBottom: 8 }}>현재 예약 가능한 날짜가 없습니다</div>
              <div style={{ fontSize: 13, color: '#71717a' }}>문의: 010-2838-2391</div>
            </div>
          )}

          {!configLoading && config && config.enabled && dates.length > 0 && (
            <>
              {/* 날짜 캘린더 */}
              <div style={{ fontSize: 13, fontWeight: 700, color: '#52525b', marginBottom: 8 }}>날짜 선택</div>
              <div className="consult-cal" style={{ marginBottom: 20 }}>
                <DayPicker
                  mode="single"
                  selected={selectedDateObj}
                  onSelect={d => { if (d) setSelectedDate(ymd(d)) }}
                  disabled={[{ dayOfWeek: closedWeekdays }, { before: minDate }, { after: maxDate }]}
                  startMonth={minDate}
                  endMonth={maxDate}
                  defaultMonth={selectedDateObj ?? minDate}
                  weekStartsOn={0}
                  formatters={{
                    formatCaption: m => `${m.getFullYear()}년 ${m.getMonth() + 1}월`,
                    formatWeekdayName: d => WEEKDAY_LABELS[d.getDay()],
                  }}
                />
              </div>

              {/* 시간 격자 */}
              <div style={{ fontSize: 13, fontWeight: 700, color: '#52525b', marginBottom: 8 }}>시간 선택</div>
              {slotsLoading ? (
                <div style={{ padding: '28px 0', textAlign: 'center', color: '#8c959f', fontSize: 13 }}>시간 불러오는 중...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 22 }}>
                  {hours.map(h => {
                    const disabled = taken.has(h) || !isBookable(selectedDate!, h, now)
                    const active = selectedHour === h
                    return (
                      <button key={h} type="button" disabled={disabled}
                        onClick={() => setSelectedHour(h)}
                        style={{
                          padding: '12px 4px', borderRadius: 10,
                          border: active ? '2px solid #2563eb' : '1px solid #c8d0dc',
                          background: disabled ? '#f4f4f5' : active ? '#dbeafe' : '#fff',
                          color: disabled ? '#c4c4cc' : active ? '#1d4ed8' : '#3f3f46',
                          fontSize: 14, fontWeight: active ? 800 : 600,
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                          textDecoration: disabled && taken.has(h) ? 'line-through' : 'none',
                        }}>
                        <span>{h}시</span>
                        {taken.has(h) && <span style={{ fontSize: 10, fontWeight: 600 }}>마감</span>}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* 신청자 정보 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#52525b', marginBottom: 6 }}>이름</div>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="이름"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#2563eb' }}
                    onBlur={e => { e.target.style.borderColor = '#c8d0dc' }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#52525b', marginBottom: 6 }}>학년</div>
                  <select value={grade} onChange={e => setGrade(e.target.value)}
                    style={{ ...inputStyle, appearance: 'auto' as never, color: grade ? '#18181b' : '#9ca3af' }}>
                    <option value="">학년 선택</option>
                    {GRADE_OPTIONS.map(g => <option key={g} value={g} style={{ color: '#18181b' }}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#52525b', marginBottom: 6 }}>연락처</div>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#2563eb' }}
                    onBlur={e => { e.target.style.borderColor = '#c8d0dc' }} />
                </div>
              </div>

              {notice && (
                <div style={{ margin: '4px 0 0', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#dc2626', fontWeight: 600 }}>
                  {notice}
                </div>
              )}
            </>
          )}
        </div>

        {/* 하단 예약 버튼 */}
        {!configLoading && config && config.enabled && dates.length > 0 && (
          <div className="apply-btn-area">
            <button onClick={handleSubmit} disabled={!canSubmit}
              style={{
                flex: 1, padding: '14px 0', border: 'none', borderRadius: 11,
                background: canSubmit ? '#2563eb' : '#bfdbfe',
                color: '#fff', fontSize: 16, fontWeight: 700,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}>
              {submitting ? '예약 중...'
                : selectedDate && selectedHour !== null
                  ? `${mdLabel(selectedDate)} ${selectedHour}시 예약하기`
                  : '예약하기'}
            </button>
          </div>
        )}
      </div>

      {submitted && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(24,24,27,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '40px 28px', textAlign: 'center', width: '100%', maxWidth: 360 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28, color: '#22c55e' }}>✓</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#18181b', marginBottom: 8 }}>상담 예약이 완료되었습니다</div>
            <div style={{ fontSize: 14, color: '#71717a', lineHeight: 1.6, marginBottom: 28 }}>
              {selectedDate && selectedHour !== null && (
                <><b style={{ color: '#2563eb' }}>{mdLabel(selectedDate)} {selectedHour}시</b> 상담<br /></>
              )}
              예약 시간에 맞춰 연락드리겠습니다.<br />문의: 010-2838-2391
            </div>
            <button onClick={() => navigate('/')}
              style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 11, padding: '14px 0', fontWeight: 700, fontSize: 16 }}>
              홈으로
            </button>
          </div>
        </div>
      )}

      <style>{`
        .consult-cal { display: flex; justify-content: center; }
        .consult-cal .rdp-root {
          --rdp-accent-color: #2563eb;
          --rdp-accent-background-color: #dbeafe;
          --rdp-today-color: #2563eb;
          --rdp-day-width: 42px;
          --rdp-day-height: 42px;
          --rdp-day_button-width: 38px;
          --rdp-day_button-height: 38px;
          --rdp-day_button-border-radius: 10px;
          font-family: inherit;
          margin: 0;
        }
        .consult-cal .rdp-caption_label { font-weight: 800; color: #18181b; font-size: 15px; }
        .consult-cal .rdp-weekday { color: #8c959f; font-weight: 600; font-size: 12px; text-transform: none; }
        .consult-cal .rdp-day_button { font-size: 14px; color: #3f3f46; font-family: inherit; }
        .consult-cal .rdp-selected .rdp-day_button { font-weight: 800; border: 2px solid #2563eb; }
        .consult-cal .rdp-disabled { opacity: 0.28; }
        .consult-cal .rdp-nav button { color: #52525b; }
      `}</style>
    </>
  )
}
