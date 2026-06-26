import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, getDocs, serverTimestamp, query, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Form, Question } from '../types'

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid #e5e5ea', borderRadius: 10,
  padding: '12px 14px', fontSize: 15, outline: 'none',
  background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit',
}

function findAnswer(questions: Question[], keyword: string, answers: Record<string, string | string[]>): string {
  const q = questions.find(q => q.label.includes(keyword))
  return q ? ((answers[q.id] as string) || '') : ''
}

export default function Apply() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
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

  const sections = activeForm?.sections ?? []
  const currentSection = sections[step]
  const currentQuestions = currentSection?.questions ?? []
  const allQuestions = sections.flatMap(s => s.questions)
  const isLastStep = step === sections.length - 1

  // '아니오' 선택된 필수 radio가 있으면 차단
  const hasDenied = currentQuestions.some(
    q => q.type === 'radio' && q.required && answers[q.id] === '아니오'
  )
  const currentCanProceed = !hasDenied && currentQuestions
    .filter(q => q.required && q.type !== 'info')
    .every(q => {
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
        name: findAnswer(allQuestions, '이름', answers),
        course: findAnswer(allQuestions, '수업', answers) || findAnswer(allQuestions, '과목', answers),
        school: findAnswer(allQuestions, '학교', answers),
        phone: findAnswer(allQuestions, '연락처', answers) || findAnswer(allQuestions, '전화', answers),
        submittedAt: serverTimestamp(),
        status: 'new',
        formId: activeForm?.id,
        detail: answers,
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
        <div style={{ fontSize: 15, fontWeight: 700, color: '#18181b', marginBottom: 12 }}>
          {q.label}
        </div>

        {q.type === 'short' && (
          <input type="text" value={(ans as string) || ''} onChange={e => setAnswer(q.id, e.target.value)}
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#2563eb' }}
            onBlur={e => { e.target.style.borderColor = '#e5e5ea' }} />
        )}

        {q.type === 'long' && (
          <textarea value={(ans as string) || ''} onChange={e => setAnswer(q.id, e.target.value)}
            rows={4} style={{ ...inputStyle, resize: 'vertical' }}
            onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#2563eb' }}
            onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#e5e5ea' }} />
        )}

        {q.type === 'number' && (
          <input type="number" value={(ans as string) || ''} onChange={e => setAnswer(q.id, e.target.value)}
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#2563eb' }}
            onBlur={e => { e.target.style.borderColor = '#e5e5ea' }} />
        )}

        {q.type === 'date' && (
          <input type="date" value={(ans as string) || ''} onChange={e => setAnswer(q.id, e.target.value)}
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#2563eb' }}
            onBlur={e => { e.target.style.borderColor = '#e5e5ea' }} />
        )}

        {q.type === 'radio' && (
          <>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {q.options?.map(opt => (
                <button key={opt} type="button" onClick={() => setAnswer(q.id, opt)}
                  style={{
                    flex: 1, minWidth: 72, padding: '11px 8px', borderRadius: 10,
                    border: ans === opt ? '2px solid #2563eb' : '1px solid #e5e5ea',
                    background: ans === opt ? '#dbeafe' : '#fff',
                    fontSize: 14, fontWeight: ans === opt ? 700 : 500,
                    color: ans === opt ? '#1d4ed8' : '#52525b',
                  }}>{opt}</button>
              ))}
            </div>
            {q.required && ans === '아니오' && (
              <div style={{ marginTop: 10, padding: '10px 14px', background: '#fef2f2', borderRadius: 8, fontSize: 13, color: '#ef4444', fontWeight: 600 }}>
                동의하지 않으시면 신청을 진행할 수 없습니다.
              </div>
            )}
          </>
        )}

        {q.type === 'ox' && (
          <div style={{ display: 'flex', gap: 8 }}>
            {['O', 'X'].map(opt => (
              <button key={opt} type="button" onClick={() => setAnswer(q.id, opt)}
                style={{
                  flex: 1, padding: '14px 8px', borderRadius: 10,
                  border: ans === opt ? '2px solid #2563eb' : '1px solid #e5e5ea',
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
                    border: checked ? '2px solid #2563eb' : '1px solid #e5e5ea',
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

        {(q.type === 'omr') && (
          <input type="number" value={(ans as string) || ''} onChange={e => setAnswer(q.id, e.target.value)}
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#2563eb' }}
            onBlur={e => { e.target.style.borderColor = '#e5e5ea' }} />
        )}
      </div>
    )
  }

  if (formLoading) {
    return (
      <div style={{ padding: '80px 18px', textAlign: 'center', color: '#8c959f', fontSize: 14 }}>
        불러오는 중...
      </div>
    )
  }

  if (!activeForm || sections.length === 0) {
    return (
      <div style={{ padding: '60px 18px', textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#18181b', marginBottom: 8 }}>수강 신청 준비 중입니다</div>
        <div style={{ fontSize: 14, color: '#71717a' }}>곧 오픈될 예정입니다. 문의: 010-2838-2391</div>
      </div>
    )
  }

  return (
    <>
      <div className="md:max-w-[680px] md:mx-auto md:px-7">

        {/* 스텝 인디케이터 — 섹션 기반 동적 */}
        <div className="step-indicator" style={{ padding: '20px 18px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            {sections.map((sec, i) => (
              <div key={sec.id} style={{ display: 'flex', alignItems: 'center', flex: i < sections.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: step >= i ? '#2563eb' : '#d4d9e0',
                    border: step === i ? '2px solid #1d4ed8' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    color: step >= i ? '#fff' : '#a1a1aa',
                    boxShadow: step === i ? '0 0 0 3px #93c5fd' : 'none',
                  }}>
                    {step > i ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: step >= i ? '#1d4ed8' : '#a1a1aa', whiteSpace: 'nowrap' }}>
                    {sec.title || `${i + 1}단계`}
                  </span>
                </div>
                {i < sections.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: step > i ? '#2563eb' : '#d4d9e0', margin: '0 6px', marginBottom: 18 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px 18px 24px' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#18181b', marginBottom: 20 }}>
            {currentSection?.title || `${step + 1}단계`}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(() => {
              let qNum = 0
              return currentQuestions.map(q => {
                const idx = qNum
                if (q.type !== 'info') qNum++
                return renderQuestion(q, idx)
              })
            })()}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="apply-btn-area">
          {step > 0 && (
            <button onClick={goPrev}
              style={{ flex: '0 0 auto', padding: '14px 22px', border: '1px solid #e5e5ea', borderRadius: 11, background: '#fff', fontSize: 15, fontWeight: 600, color: '#52525b' }}>
              이전
            </button>
          )}
          {!isLastStep && (
            <button onClick={goNext} disabled={!currentCanProceed}
              style={{
                flex: 1, padding: '14px 0', border: 'none', borderRadius: 11,
                background: currentCanProceed ? '#2563eb' : '#93c5fd',
                color: '#fff', fontSize: 16, fontWeight: 700,
                cursor: currentCanProceed ? 'pointer' : 'not-allowed',
              }}>
              다음
            </button>
          )}
          {isLastStep && (
            <button onClick={handleSubmit} disabled={!currentCanProceed || submitting}
              style={{
                flex: 1, padding: '14px 0', border: 'none', borderRadius: 11,
                background: currentCanProceed && !submitting ? '#2563eb' : '#93c5fd',
                color: '#fff', fontSize: 16, fontWeight: 700,
                cursor: currentCanProceed && !submitting ? 'pointer' : 'not-allowed',
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
