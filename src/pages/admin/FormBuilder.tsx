import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import SortableQuestion from '../../components/builder/SortableQuestion'
import { useForms } from '../../hooks/useForms'
import type { Form, Section, Question, QuestionType, FormType } from '../../types'

const newId = () => crypto.randomUUID()

const FORM_TYPE_OPTIONS: { value: FormType; label: string }[] = [
  { value: 'enrollment', label: '수강신청' },
  { value: 'generic', label: '일반신청' },
  { value: 'quiz', label: '퀴즈' },
]

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'short', label: '단답형' },
  { value: 'long', label: '장문형' },
  { value: 'radio', label: '객관식' },
  { value: 'checkbox', label: '다중선택' },
  { value: 'ox', label: 'O/X' },
  { value: 'dropdown', label: '드롭다운' },
  { value: 'date', label: '날짜' },
  { value: 'number', label: '숫자' },
  { value: 'info', label: 'PDF' },
]

export default function FormBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { getForm, createForm, updateForm } = useForms()

  const [form, setForm] = useState<Omit<Form, 'id' | 'createdAt'> | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [addTypeOpen, setAddTypeOpen] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setAddTypeOpen(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (id && id !== 'new') {
      getForm(id).then(f => {
        if (f) setForm({ title: f.title, description: f.description, type: f.type, isActive: f.isActive, sections: f.sections })
      })
    } else {
      const formData = location.state?.formData
      if (formData) {
        setForm(formData)
      } else {
        setForm({
          title: '', description: '', type: 'enrollment', isActive: false,
          sections: [{ id: newId(), title: '섹션 1', questions: [] }],
        })
      }
    }
  }, [id])

  if (!form) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#8c959f', fontSize: 14 }}>
      불러오는 중...
    </div>
  )

  // ── Section helpers ───────────────────────────────────────────
  const addSection = () => {
    setForm(f => f && ({
      ...f,
      sections: [...f.sections, { id: newId(), title: `섹션 ${f.sections.length + 1}`, questions: [] }],
    }))
  }

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setForm(f => f && ({
      ...f,
      sections: f.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s),
    }))
  }

  const deleteSection = (sectionId: string) => {
    if (form.sections.length <= 1) return alert('섹션은 최소 1개 이상 있어야 합니다.')
    if (!confirm('이 섹션을 삭제할까요? 안의 질문도 모두 삭제됩니다.')) return
    setForm(f => f && ({ ...f, sections: f.sections.filter(s => s.id !== sectionId) }))
  }

  const moveSectionUp = (index: number) => {
    if (index === 0) return
    setForm(f => f && ({ ...f, sections: arrayMove(f.sections, index, index - 1) }))
  }

  const moveSectionDown = (index: number) => {
    if (!form || index === form.sections.length - 1) return
    setForm(f => f && ({ ...f, sections: arrayMove(f.sections, index, index + 1) }))
  }

  // ── Question helpers ──────────────────────────────────────────
  const addQuestion = (sectionId: string, type: QuestionType) => {
    const newQuestion: Question = {
      id: newId(), type, label: '', required: false,
      options: ['radio', 'checkbox', 'dropdown'].includes(type) ? ['선택지 1', '선택지 2'] : undefined,
    }
    setForm(f => f && ({
      ...f,
      sections: f.sections.map(s =>
        s.id === sectionId ? { ...s, questions: [...s.questions, newQuestion] } : s
      ),
    }))
    setExpandedId(newQuestion.id)
    setAddTypeOpen(null)
  }

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    setForm(f => f && ({
      ...f,
      sections: f.sections.map(s =>
        s.id === sectionId
          ? { ...s, questions: s.questions.map(q => q.id === questionId ? { ...q, ...updates } : q) }
          : s
      ),
    }))
  }

  const deleteQuestion = (sectionId: string, questionId: string) => {
    if (!confirm('이 질문을 삭제할까요?')) return
    setForm(f => f && ({
      ...f,
      sections: f.sections.map(s =>
        s.id === sectionId ? { ...s, questions: s.questions.filter(q => q.id !== questionId) } : s
      ),
    }))
    if (expandedId === questionId) setExpandedId(null)
  }

  // ── DnD ──────────────────────────────────────────────────────
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setForm(f => {
      if (!f) return f
      const sections = f.sections.map(section => {
        const oldIndex = section.questions.findIndex(q => q.id === active.id)
        const newIndex = section.questions.findIndex(q => q.id === over.id)
        if (oldIndex === -1 || newIndex === -1) return section
        return { ...section, questions: arrayMove(section.questions, oldIndex, newIndex) }
      })
      return { ...f, sections }
    })
  }

  // ── Save ─────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim()) return alert('폼 제목을 입력해주세요.')
    setSaving(true)
    try {
      if (id && id !== 'new') {
        await updateForm(id, form)
      } else {
        await createForm(form)
      }
      navigate('/admin/builder')
    } catch (e) {
      alert('저장 실패: ' + (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ paddingBottom: 32 }} className="md:max-w-[1100px] md:mx-auto">

      {/* 페이지 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 18px 0', gap: 12 }}>
        <div>
          <button
            onClick={() => navigate('/admin/builder')}
            style={{ background: 'none', border: 'none', color: '#8c959f', fontSize: 12, fontWeight: 600, padding: '0 0 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            ← 폼 목록으로
          </button>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#18181b', marginTop: 2 }}>
            {form.title || '새 폼'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {/* 활성 토글 */}
          <button
            onClick={() => setForm(f => f && ({ ...f, isActive: !f.isActive }))}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <div style={{
              position: 'relative', width: 40, height: 22, borderRadius: 999,
              background: form.isActive ? '#22c55e' : '#d4d4d8',
              transition: 'background 0.2s',
            }}>
              <div style={{
                position: 'absolute', top: 3, left: form.isActive ? 21 : 3,
                width: 16, height: 16, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s',
              }} />
            </div>
            <span style={{ fontSize: 12, color: form.isActive ? '#15803d' : '#8c959f', fontWeight: 600 }}>
              {form.isActive ? '활성' : '비활성'}
            </span>
          </button>
          {/* 저장 */}
          <button
            onClick={() => navigate('/admin/builder')}
            style={{ background: '#f4f4f6', border: 'none', color: '#52525b', fontWeight: 600, fontSize: 13, padding: '9px 14px', borderRadius: 10, whiteSpace: 'nowrap', cursor: 'pointer' }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saving ? '#93c5fd' : '#2563eb',
              border: 'none', color: '#fff',
              fontWeight: 700, fontSize: 14,
              padding: '9px 18px', borderRadius: 10,
              whiteSpace: 'nowrap', cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* 폼 제목 + 설명 */}
      <div style={{
        margin: '14px 18px',
        background: '#fff',
        border: '1px solid #c8d0dc',
        borderLeft: '4px solid #2563eb',
        borderRadius: 12,
        padding: '18px 18px 16px',
      }}>
        <input
          value={form.title}
          onChange={e => setForm(f => f && ({ ...f, title: e.target.value }))}
          placeholder="폼 제목"
          style={{
            width: '100%', fontSize: 18, fontWeight: 800, color: '#18181b',
            border: 'none', borderBottom: '2px solid #c8d0dc',
            outline: 'none', paddingBottom: 8, marginBottom: 10,
            background: 'transparent', boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
          onFocus={e => { e.target.style.borderBottomColor = '#2563eb' }}
          onBlur={e => { e.target.style.borderBottomColor = '#c8d0dc' }}
        />
        <input
          value={form.description}
          onChange={e => setForm(f => f && ({ ...f, description: e.target.value }))}
          placeholder="설명 (선택)"
          style={{
            width: '100%', fontSize: 13, color: '#52525b',
            border: 'none', borderBottom: '1px solid #f4f4f6',
            outline: 'none', paddingBottom: 6,
            background: 'transparent', boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
          onFocus={e => { e.target.style.borderBottomColor = '#2563eb' }}
          onBlur={e => { e.target.style.borderBottomColor = '#f4f4f6' }}
        />
      </div>

      {/* 섹션 목록 */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#52525b', marginBottom: 6 }}>폼 종류</div>
          <select
            value={form.type}
            onChange={e => setForm(f => f && ({ ...f, type: e.target.value as FormType }))}
            style={{ width: '100%', border: '1px solid #c8d0dc', borderRadius: 10, padding: '10px 12px', fontSize: 13, background: '#fff', outline: 'none' }}
          >
            {FORM_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {form.sections.map((section, sectionIndex) => (
            <div
              key={section.id}
              style={{ background: '#fff', border: '1px solid #c8d0dc', borderRadius: 14 }}
            >
              {/* 섹션 헤더 */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px',
                background: '#f4f4f6',
                borderBottom: '1px solid #c8d0dc',
                borderRadius: '14px 14px 0 0',
              }}>
                <input
                  value={section.title}
                  onChange={e => updateSection(section.id, { title: e.target.value })}
                  placeholder="섹션 제목"
                  style={{
                    flex: 1, fontSize: 13, fontWeight: 700, color: '#3f3f46',
                    background: 'transparent', border: 'none', outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
                <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                  <button
                    onClick={() => moveSectionUp(sectionIndex)}
                    disabled={sectionIndex === 0}
                    style={{ background: sectionIndex === 0 ? '#f9fafb' : '#fff', border: '1px solid #c8d0dc', color: sectionIndex === 0 ? '#d4d4d8' : '#52525b', fontSize: 13, padding: '5px 9px', borderRadius: 7, cursor: sectionIndex === 0 ? 'default' : 'pointer', minWidth: 30, minHeight: 30 }}
                  >↑</button>
                  <button
                    onClick={() => moveSectionDown(sectionIndex)}
                    disabled={sectionIndex === form.sections.length - 1}
                    style={{ background: sectionIndex === form.sections.length - 1 ? '#f9fafb' : '#fff', border: '1px solid #c8d0dc', color: sectionIndex === form.sections.length - 1 ? '#d4d4d8' : '#52525b', fontSize: 13, padding: '5px 9px', borderRadius: 7, cursor: sectionIndex === form.sections.length - 1 ? 'default' : 'pointer', minWidth: 30, minHeight: 30 }}
                  >↓</button>
                  <button
                    onClick={() => deleteSection(section.id)}
                    style={{ background: '#fff', border: '1px solid #fee2e2', color: '#ef4444', fontSize: 13, padding: '5px 9px', borderRadius: 7, cursor: 'pointer', minWidth: 30, minHeight: 30, fontWeight: 700 }}
                  >×</button>
                </div>
              </div>

              {/* 질문 목록 */}
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <SortableContext
                  items={section.questions.map(q => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {section.questions.length === 0 && (
                    <p style={{ fontSize: 13, color: '#d4d4d8', textAlign: 'center', padding: '16px 0' }}>
                      질문을 추가해보세요
                    </p>
                  )}
                  {section.questions.map(question => (
                    <SortableQuestion
                      key={question.id}
                      question={question}
                      isExpanded={expandedId === question.id}
                      sectionId={section.id}
                      sections={form.sections}
                      onToggle={() => setExpandedId(expandedId === question.id ? null : question.id)}
                      onChange={updates => updateQuestion(section.id, question.id, updates)}
                      onDelete={() => deleteQuestion(section.id, question.id)}
                    />
                  ))}
                </SortableContext>

                {/* 질문 추가 */}
                <div style={{ position: 'relative', marginTop: 4 }} ref={dropdownRef}>
                  <button
                    onClick={() => setAddTypeOpen(addTypeOpen === section.id ? null : section.id)}
                    style={{
                      background: '#dbeafe', border: '1px solid #93c5fd',
                      fontSize: 13, fontWeight: 700,
                      color: '#1d4ed8', cursor: 'pointer', padding: '8px 16px',
                      borderRadius: 8, minHeight: 36,
                    }}
                  >
                    + 질문 추가
                  </button>
                  {addTypeOpen === section.id && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }} onClick={() => setAddTypeOpen(null)} />
                      <div style={{
                        position: 'absolute', left: 0, top: 32,
                        background: '#fff', border: '1px solid #c8d0dc',
                        borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        zIndex: 10, padding: 8,
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4,
                        width: 240,
                      }}>
                        {TYPE_OPTIONS.map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => addQuestion(section.id, value)}
                            style={{
                              background: 'none', border: 'none',
                              fontSize: 12, color: '#52525b', fontWeight: 600,
                              padding: '8px 4px', borderRadius: 8,
                              cursor: 'pointer', textAlign: 'center',
                              fontFamily: 'inherit',
                            }}
                            onMouseEnter={e => {
                              const el = e.currentTarget as HTMLButtonElement
                              el.style.background = '#dbeafe'
                              el.style.color = '#1d4ed8'
                            }}
                            onMouseLeave={e => {
                              const el = e.currentTarget as HTMLButtonElement
                              el.style.background = 'none'
                              el.style.color = '#52525b'
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DndContext>

      {/* 섹션 추가 */}
      <button
        onClick={addSection}
        style={{
          display: 'block', margin: '12px 18px 0', width: 'calc(100% - 36px)',
          border: '2px dashed #c8d0dc', background: '#fff',
          color: '#8c959f', fontSize: 14, fontWeight: 600,
          padding: '14px', borderRadius: 12, cursor: 'pointer',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.borderColor = '#2563eb'
          el.style.color = '#2563eb'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.borderColor = '#c8d0dc'
          el.style.color = '#8c959f'
        }}
      >
        + 섹션 추가
      </button>
    </div>
  )
}
