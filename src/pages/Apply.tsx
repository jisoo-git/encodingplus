import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, getDocs, serverTimestamp, query, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Form, Question } from '../types'

const COURSE_OPTIONS = [
  { name: '입시 단기특강', desc: '특별전형 + 일반전형 병행 · 토요일 6h + 수요일 1h' },
  { name: '일반전형 특강', desc: '소질적성검사 + 면접 · 토/일 3h + 수요일 1h' },
]

const NOTICES = [
  { id: '1', title: '수업 개설 기준', body: '수업은 최소 2명 이상 등록 시 개설됩니다. 인원 미달 시 개별 안내 후 환불 처리됩니다.' },
  { id: '2', title: '결석·보충 안내', body: '수요일 비대면 수업은 보충이 불가합니다. 대면 수업은 1회에 한해 사전 연락 후 보충 가능합니다.' },
  { id: '3', title: '수강료 납부', body: '수강료는 매월 첫 수업 전까지 납부해 주세요. 미납 시 수업 참여가 제한될 수 있습니다.' },
  { id: '4', title: '환불 규정', body: '수강 취소는 개강 1주일 전까지 전액 환불 가능합니다. 이후 취소 시 이미 진행된 수업 횟수에 따라 차등 환불됩니다.' },
]

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid #c8d0dc', borderRadius: 10,
  padding: '12px 14px', fontSize: 15, outline: 'none',
  background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit',
}

function findAnswer(questions: Question[], keyword: string, answers: Record<string, string | string[]>): string {
  const q = questions.find(q => q.label.includes(keyword))
  return q ? ((answers[q.id] as string) || '') : ''
}

export default function Apply() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [privacy, setPrivacy] = useState<string | null>(null)
  const [course, setCourse] = useState<string | null>(null)
  const [noticeChecked, setNoticeChecked] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [activeForm, setActiveForm] = useState<Form | null>(null)
  const [formLoading, setFormLoading] = useState(true)

  useEffect(() => {
    async function fetchActiveForm() {
      try {
        const snap = await getDocs(query(collection(db, 'forms'), where('isActive', '==', true)))
        if (!snap.empty) {
          const d = snap.docs[0]
          setActiveForm({ id: d.id, ...(d.data() as Omit<Form, 'id'>) })
        }
      } catch {}
      finally { setFormLoading(false) }
    }
    fetchActiveForm()
  }, [])

  // 신청 확인 섹션 — info 타입 질문만 (PDF 링크 포함)
  const confirmSection = activeForm?.sections.find(s => s.title === '신청 확인') ?? null
  const confirmInfos = (confirmSection?.questions ?? []).filter(q => q.type === 'info')

  // 유의사항 섹션 — 제목 '유의사항'인 섹션의 info 타입 질문만 (없으면 하드코딩 NOTICES 사용)
  const noticesSection = activeForm?.sections.find(s => s.title === '유의사항') ?? null
  const formNotices = (noticesSection?.questions ?? []).filter(q => q.type === 'info')

  // 선택된 수업명과 정확히 일치하는 섹션만 사용
  const courseSection = course
    ? (activeForm?.sections.find(s => s.title === course) ?? null)
    : null
  const step3Questions = courseSection?.questions ?? []

  const step1CanNext = privacy === '네' && course !== null
  const step2CanNext = noticeChecked
  const step3CanSubmit = !formLoading && activeForm !== null &&
    step3Questions.filter(q => q.required && q.type !== 'info').every(q => {
      const val = answers[q.id]
      if (Array.isArray(val)) return val.length > 0
      return (val || '').trim() !== ''
    })

  const setAnswer = (id: string, val: string | string[]) =>
    setAnswers(prev => ({ ...prev, [id]: val }))

  const toggleCheckbox = (id: string, option: string) => {
    setAnswers(prev => {
      const cur = (prev[id] as string[]) || []
      const next = cur.includes(option) ? cur.filter(v => v !== option) : [...cur, option]
      return { ...prev, [id]: next }
    })
  }

  const goNext = () => { setStep(s => s + 1); window.scrollTo(0, 0) }
  const goPrev = () => { setStep(s => s - 1); window.scrollTo(0, 0) }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'submissions'), {
        name: findAnswer(step3Questions, '이름', answers),
        course,
        school: findAnswer(step3Questions, '학교', answers),
        phone: findAnswer(step3Questions, '연락처', answers) || findAnswer(step3Questions, '전화', answers),
        submittedAt: serverTimestamp(),
        status: 'new',
        formId: activeForm?.id,
        detail: Object.fromEntries(
          step3Questions
            .filter(q => q.type !== 'info' && answers[q.id] !== undefined)
            .map(q => [q.label, Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).join(', ') : answers[q.id]])
        ),
      })
      setSubmitted(true)
    } catch {
      alert('제출 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  function renderQuestion(q: Question, qNum: number) {
    const ans = answers[q.id]

    if (q.type === 'info') {
      return (
        <div key={q.id} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 14, color: '#1e3a8a', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{q.label}</div>
          {q.linkUrl && (
            <a href={q.linkUrl} target="_blank" rel="noreferrer"
              style={{ display: 'inline-block', marginTop: 10, fontSize: 13, color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}>
              {q.linkText || q.linkUrl}
            </a>
          )}
        </div>
      )
    }

    return (
      <div key={q.id} style={{ background: '#fff', border: '1px solid #c8d0dc', borderRadius: 14, padding: 18, boxShadow: '0 1px 4px rgba(0,55,112,0.05)' }}>
        <div style={{ fontSize: 12, color: '#8c959f', fontWeight: 600, marginBottom: 4 }}>
          Q{qNum + 1}{q.required ? ' · 필수' : ''}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#18181b', marginBottom: 12 }}>{q.label}</div>

        {q.type === 'short' && (
          <input type="text" value={(ans as string) || ''} onChange={e => setAnswer(q.id, e.target.value)}
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#2563eb' }}
            onBlur={e => { e.target.style.borderColor = '#c8d0dc' }} />
        )}
        {q.type === 'long' && (
          <textarea value={(ans as string) || ''} onChange={e => setAnswer(q.id, e.target.value)}
            rows={4} style={{ ...inputStyle, resize: 'vertical' }}
            onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#2563eb' }}
            onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#c8d0dc' }} />
        )}
        {q.type === 'number' && (
          <input type="number" value={(ans as string) || ''} onChange={e => setAnswer(q.id, e.target.value)}
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#2563eb' }}
            onBlur={e => { e.target.style.borderColor = '#c8d0dc' }} />
        )}
        {q.type === 'date' && (
          <input type="date" value={(ans as string) || ''} onChange={e => setAnswer(q.id, e.target.value)}
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#2563eb' }}
            onBlur={e => { e.target.style.borderColor = '#c8d0dc' }} />
        )}
        {q.type === 'radio' && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {q.options?.map(opt => (
              <button key={opt} type="button" onClick={() => setAnswer(q.id, opt)}
                style={{
                  flex: 1, minWidth: 72, padding: '11px 8px', borderRadius: 10,
                  border: ans === opt ? '2px solid #2563eb' : '1px solid #c8d0dc',
                  background: ans === opt ? '#dbeafe' : '#fff',
                  fontSize: 14, fontWeight: ans === opt ? 700 : 500,
                  color: ans === opt ? '#1d4ed8' : '#52525b',
                }}>{opt}</button>
            ))}
          </div>
        )}
        {q.type === 'ox' && (
          <div style={{ display: 'flex', gap: 8 }}>
            {['O', 'X'].map(opt => (
              <button key={opt} type="button" onClick={() => setAnswer(q.id, opt)}
                style={{
                  flex: 1, padding: '14px 8px', borderRadius: 10,
                  border: ans === opt ? '2px solid #2563eb' : '1px solid #c8d0dc',
                  background: ans === opt ? '#dbeafe' : '#fff',
                  fontSize: 22, fontWeight: 800,
                  color: ans === opt ? '#1d4ed8' : '#52525b',
                }}>{opt}</button>
            ))}
          </div>
        )}
        {q.type === 'checkbox' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.options?.map(opt => {
              const checked = ((ans as string[]) || []).includes(opt)
              return (
                <button key={opt} type="button" onClick={() => toggleCheckbox(q.id, opt)}
                  style={{
                    padding: '12px 14px', textAlign: 'left', borderRadius: 10,
                    border: checked ? '2px solid #2563eb' : '1px solid #c8d0dc',
                    background: checked ? '#dbeafe' : '#fff',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                    background: checked ? '#2563eb' : '#fff',
                    border: checked ? '2px solid #2563eb' : '2px solid #d4d4d8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 12, fontWeight: 700,
                  }}>{checked ? '✓' : ''}</div>
                  <span style={{ fontSize: 14, fontWeight: checked ? 600 : 400, color: checked ? '#1d4ed8' : '#52525b' }}>{opt}</span>
                </button>
              )
            })}
          </div>
        )}
        {q.type === 'dropdown' && (
          <select value={(ans as string) || ''} onChange={e => setAnswer(q.id, e.target.value)}
            style={{ ...inputStyle, appearance: 'auto' as never }}>
            <option value="">선택하세요</option>
            {q.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        )}
        {q.type === 'omr' && (
          <input type="number" value={(ans as string) || ''} onChange={e => setAnswer(q.id, e.target.value)}
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#2563eb' }}
            onBlur={e => { e.target.style.borderColor = '#c8d0dc' }} />
        )}
      </div>
    )
  }

  return (
    <>
      <div className="md:max-w-[680px] md:mx-auto md:px-7">

        {/* 스텝 인디케이터 */}
        <div className="step-indicator" style={{ padding: '20px 18px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            {[{ n: 1, label: '신청 확인' }, { n: 2, label: '유의사항' }, { n: 3, label: '정보 입력' }].map(({ n, label }, i) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: step >= n ? '#2563eb' : '#d4d9e0',
                    border: step === n ? '2px solid #1d4ed8' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    color: step >= n ? '#fff' : '#a1a1aa',
                    boxShadow: step === n ? '0 0 0 3px #93c5fd' : 'none',
                  }}>
                    {step > n ? '✓' : n}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: step >= n ? '#1d4ed8' : '#a1a1aa', whiteSpace: 'nowrap' }}>{label}</span>
                </div>
                {i < 2 && (
                  <div style={{ flex: 1, height: 2, background: step > n ? '#2563eb' : '#d4d9e0', margin: '0 6px', marginBottom: 18 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px 18px 24px' }}>

          {/* ── STEP 1: 개인정보 + 수업 선택 ── */}
          {step === 1 && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#18181b', marginBottom: 20 }}>신청 전 확인</div>

              {confirmInfos.length > 0
                ? confirmInfos.map(q => (
                    <div key={q.id} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
                      <div style={{ fontSize: 14, color: '#1e3a8a', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{q.label}</div>
                      {q.linkUrl && (
                        <a href={q.linkUrl} target="_blank" rel="noreferrer"
                          style={{ display: 'inline-block', marginTop: 10, fontSize: 13, color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}>
                          {q.linkText || q.linkUrl}
                        </a>
                      )}
                    </div>
                  ))
                : (
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
                      <div style={{ fontSize: 14, color: '#1e3a8a', lineHeight: 1.75 }}>
                        수강신청 시 입력하신 개인정보(이름, 연락처, 학교 등)는 수업 운영 및 안내 목적으로만 사용되며, 제3자에게 제공되지 않습니다.
                      </div>
                    </div>
                  )
              }

              <div style={{ background: '#fff', border: '1px solid #c8d0dc', borderRadius: 14, padding: 20, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,55,112,0.05)' }}>
                <div style={{ fontSize: 12, color: '#8c959f', fontWeight: 600, marginBottom: 6 }}>Q1 · 필수</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#18181b', marginBottom: 12 }}>개인정보 활용에 동의하십니까?</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['네', '아니오'].map(opt => (
                    <button key={opt} type="button" onClick={() => setPrivacy(opt)}
                      style={{
                        flex: 1, padding: '12px 8px',
                        border: privacy === opt ? '2px solid #2563eb' : '1px solid #c8d0dc',
                        borderRadius: 10,
                        background: privacy === opt ? '#dbeafe' : '#fff',
                        fontSize: 15, fontWeight: privacy === opt ? 700 : 500,
                        color: privacy === opt ? '#1d4ed8' : '#52525b',
                      }}>{opt}</button>
                  ))}
                </div>
                {privacy === '아니오' && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef2f2', borderRadius: 8, fontSize: 13, color: '#ef4444', fontWeight: 600 }}>
                    동의하지 않으시면 수강 신청을 진행할 수 없습니다.
                  </div>
                )}
              </div>

              <div style={{ background: '#fff', border: '1px solid #c8d0dc', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,55,112,0.05)' }}>
                <div style={{ fontSize: 12, color: '#8c959f', fontWeight: 600, marginBottom: 6 }}>Q2 · 필수</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#18181b', marginBottom: 14 }}>원하시는 수업을 선택해주세요</div>
                {COURSE_OPTIONS.map(opt => (
                  <button key={opt.name} type="button" onClick={() => setCourse(opt.name)}
                    style={{
                      width: '100%', padding: '14px 16px',
                      border: course === opt.name ? '2px solid #2563eb' : '1px solid #c8d0dc',
                      borderRadius: 12,
                      background: course === opt.name ? '#dbeafe' : '#fff',
                      textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8,
                    }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      border: course === opt.name ? '6px solid #2563eb' : '2px solid #d4d4d8',
                      background: '#fff',
                    }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#18181b' }}>{opt.name}</div>
                      <div style={{ fontSize: 13, color: '#71717a', marginTop: 2 }}>{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: 유의사항 ── */}
          {step === 2 && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#18181b', marginBottom: 20 }}>유의사항 확인</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {(formNotices.length > 0 ? formNotices : NOTICES).map((item, i) => {
                  const isForm = formNotices.length > 0
                  const key = isForm ? (item as typeof formNotices[0]).id : (item as typeof NOTICES[0]).id
                  const rawLabel = isForm ? (item as typeof formNotices[0]).label : ''
                  const colonIdx = rawLabel.indexOf(':')
                  const title = isForm
                    ? (colonIdx > -1 ? rawLabel.slice(0, colonIdx).trim() : rawLabel)
                    : (item as typeof NOTICES[0]).title
                  const body = isForm
                    ? (colonIdx > -1 ? rawLabel.slice(colonIdx + 1).trim() : null)
                    : (item as typeof NOTICES[0]).body
                  return (
                    <div key={key} style={{ background: '#fff', border: '1px solid #c8d0dc', borderRadius: 14, padding: 18, boxShadow: '0 1px 4px rgba(0,55,112,0.05)' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', background: '#dbeafe', padding: '3px 8px', borderRadius: 6, flexShrink: 0, marginTop: 1 }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#18181b', marginBottom: body ? 4 : 0 }}>{title}</div>
                          {body && <div style={{ fontSize: 13, color: '#52525b', lineHeight: 1.6 }}>{body}</div>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <button type="button" onClick={() => setNoticeChecked(v => !v)}
                style={{
                  width: '100%', padding: '16px 18px',
                  border: noticeChecked ? '2px solid #2563eb' : '1px solid #c8d0dc',
                  borderRadius: 12, background: noticeChecked ? '#dbeafe' : '#fff',
                  display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: noticeChecked ? '#2563eb' : '#fff',
                  border: noticeChecked ? '2px solid #2563eb' : '2px solid #d4d4d8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 13, fontWeight: 700,
                }}>{noticeChecked ? '✓' : ''}</div>
                <span style={{ fontSize: 15, fontWeight: 600, color: noticeChecked ? '#1d4ed8' : '#52525b' }}>
                  위 유의사항을 모두 확인했습니다
                </span>
              </button>
            </div>
          )}

          {/* ── STEP 3: 수업별 정보 입력 ── */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#18181b' }}>정보 입력</div>
                <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dbeafe', padding: '4px 10px', borderRadius: 999 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>{course}</span>
                </div>
              </div>

              {formLoading && (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#8c959f', fontSize: 14 }}>불러오는 중...</div>
              )}

              {!formLoading && !activeForm && (
                <div style={{ padding: '40px 20px', textAlign: 'center', background: '#fff', borderRadius: 14, border: '1px solid #c8d0dc' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#18181b', marginBottom: 8 }}>수강 신청 준비 중입니다</div>
                  <div style={{ fontSize: 13, color: '#71717a' }}>곧 오픈될 예정입니다. 문의: 010-2838-2391</div>
                </div>
              )}

              {!formLoading && activeForm && !courseSection && (
                <div style={{ padding: '40px 20px', textAlign: 'center', background: '#fff', borderRadius: 14, border: '1px solid #c8d0dc' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#18181b', marginBottom: 8 }}>해당 수업 폼이 준비 중입니다</div>
                  <div style={{ fontSize: 13, color: '#71717a' }}>문의: 010-2838-2391</div>
                </div>
              )}

              {!formLoading && activeForm && courseSection && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(() => {
                    let qNum = 0
                    return step3Questions.map(q => {
                      const idx = qNum
                      if (q.type !== 'info') qNum++
                      return renderQuestion(q, idx)
                    })
                  })()}
                </div>
              )}
            </div>
          )}

        </div>

        {/* 하단 버튼 */}
        <div className="apply-btn-area">
          {step > 1 && (
            <button onClick={goPrev}
              style={{ flex: '0 0 auto', padding: '14px 22px', border: '1px solid #c8d0dc', borderRadius: 11, background: '#fff', fontSize: 15, fontWeight: 600, color: '#52525b' }}>
              이전
            </button>
          )}
          {step < 3 && (
            <button onClick={goNext}
              disabled={step === 1 ? !step1CanNext : !step2CanNext}
              style={{
                flex: 1, padding: '14px 0', border: 'none', borderRadius: 11,
                background: (step === 1 ? step1CanNext : step2CanNext) ? '#2563eb' : '#bfdbfe',
                color: '#fff', fontSize: 16, fontWeight: 700,
                cursor: (step === 1 ? step1CanNext : step2CanNext) ? 'pointer' : 'not-allowed',
              }}>
              다음
            </button>
          )}
          {step === 3 && (
            <button onClick={handleSubmit}
              disabled={!step3CanSubmit || submitting}
              style={{
                flex: 1, padding: '14px 0', border: 'none', borderRadius: 11,
                background: step3CanSubmit && !submitting ? '#2563eb' : '#bfdbfe',
                color: '#fff', fontSize: 16, fontWeight: 700,
                cursor: step3CanSubmit && !submitting ? 'pointer' : 'not-allowed',
              }}>
              {submitting ? '제출 중...' : '신청 완료'}
            </button>
          )}
        </div>

      </div>

      {submitted && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(24,24,27,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '40px 28px', textAlign: 'center', width: '100%', maxWidth: 360 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28, color: '#22c55e' }}>✓</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#18181b', marginBottom: 8 }}>신청이 완료되었습니다</div>
            <div style={{ fontSize: 14, color: '#71717a', lineHeight: 1.6, marginBottom: 28 }}>
              빠른 시일 내에 연락드리겠습니다.<br />문의: 010-2838-2391
            </div>
            <button onClick={() => navigate('/')}
              style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 11, padding: '14px 0', fontWeight: 700, fontSize: 16 }}>
              홈으로
            </button>
          </div>
        </div>
      )}
    </>
  )
}
