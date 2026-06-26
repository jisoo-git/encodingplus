import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// ── 타입 ─────────────────────────────────────────────────────────
type Area = { k: string; v: string }
type TimeSlot = { d: string; h: string; n: string }

interface Course {
  id: string
  types: string[]           // ['특별전형'] | ['일반전형'] | ['특별전형', '일반전형']
  name: string
  sub: string
  areas: Area[]
  times: TimeSlot[]
  detail: string[]
  price?: string
  phoneOnly?: boolean
}

interface CourseSection {
  id: string
  title: string
  desc: string
  note?: string
  courses: Course[]
}

// ── 뱃지 색상 ─────────────────────────────────────────────────────
const TYPE_STYLE: Record<string, { color: string; bg: string }> = {
  '특별전형': { color: '#1d4ed8', bg: '#dbeafe' },
  '일반전형': { color: '#15803d', bg: '#dcfce7' },
}

// ── 데이터 ────────────────────────────────────────────────────────
const ADMISSION_INFO = [
  { step: '특별전형', desc: '실적물·소질적성검사·자기소개서·면접으로 평가합니다. IT 실적 활동이 있는 학생에게 유리하며, 실적물 제작과 이론·논술을 종합 대비합니다.' },
  { step: '일반전형', desc: '내신과 소질적성검사(C언어·정보소양·논리적사고)로 평가합니다. 코딩을 처음 시작하는 학생도 충분히 준비할 수 있습니다.' },
  { step: '공통 사항', desc: '디미고는 전기학교로 전국 1곳만 지원 가능합니다. 두 전형에 동시 지원할 수 없으므로 지원 전형을 신중히 결정하세요.' },
]

const SECTIONS: CourseSection[] = [
  {
    id: 'dimigo', title: '디미고', desc: '',
    note: '2027학년도 정규 과정 · 7월 18일 개강',
    courses: [
      {
        id: 'd-special', types: ['특별전형', '일반전형'],
        name: '입시 단기특강', sub: '특별전형과 일반전형 모두 도전',
        price: '73만원 / 월 · 4회 기준',
        areas: [
          { k: '코딩/콘텐츠', v: '실적물 생산, 이론 교육' },
          { k: '적성고사', v: '이산수학, 정보학습, 실전모의고사' },
          { k: '입시논술', v: '실적설명서, 자소서, 면접대비' },
        ],
        times: [
          { d: '매주 토요일', h: '12:00 – 18:00', n: '대면 6시간' },
          { d: '매주 수요일', h: '오후 10시 또는 11시', n: '비대면 1시간 · 보충 불가' },
        ],
        detail: [
          '두 전형을 모두 도전하여 합격률을 높이는 전략입니다.',
          '특별전형 대비부터 일반전형 대비까지 16주에 걸쳐 종합적으로 대비합니다. 2027학년도 과정은 7월 18일에 개강합니다.',
        ],
      },
      {
        id: 'd-general', types: ['일반전형'],
        name: '일반전형 특강', sub: '일반전형 집중 전략',
        price: '48만원 / 월 · 4회 기준',
        areas: [
          { k: '적성(수학)', v: '이산수학을 바탕으로 수학 수업 진행' },
          { k: '정보(컴퓨터)', v: '컴퓨터 교과 내용과 상식 차원의 정보 수업이 진행' },
          { k: '입시논술', v: '인성 면접 대비' },
        ],
        times: [
          { d: '토 또는 일요일', h: '15:00 – 18:00', n: '대면 3시간' },
          { d: '매주 수요일', h: '오후 10시 또는 11시', n: '비대면 1시간 · 보충 불가' },
        ],
        detail: [
          '일반전형은 내신과 소질적성검사가 핵심입니다. 기본 정보 역량과 적성고사 대비 정도에 따라 합격이 좌우됩니다.',
          '코딩 수학과 정보 교육을 중심으로 소질적성검사를 대비하고, 면접을 함께 준비합니다.',
        ],
      },
    ],
  },
]

// ── 타입 뱃지 ─────────────────────────────────────────────────────
function TypeBadges({ types }: { types: string[] }) {
  return (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
      {types.map(t => {
        const s = TYPE_STYLE[t]
        if (!s) return null
        return (
          <span key={t} style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, color: s.color, background: s.bg, padding: '4px 10px', borderRadius: 6 }}>
            {t}
          </span>
        )
      })}
    </div>
  )
}

// ── CourseCard ────────────────────────────────────────────────────
function CourseCard({ course, onClick }: { course: Course; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="hover-card"
      style={{
        background: '#fff',
        border: '1px solid #d6dde5',
        borderRadius: 16,
        padding: 20,
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
      }}
    >
      <TypeBadges types={course.types} />
      <div style={{ fontSize: 18, fontWeight: 800, color: '#18181b', letterSpacing: '-0.02em' }}>{course.name}</div>
      <div style={{ fontSize: 13.5, color: '#52525b', marginTop: 5 }}>{course.sub}</div>

      <div style={{ fontWeight: 800, fontSize: 13, color: '#18181b', marginTop: 18, marginBottom: 2 }}>수업 구성</div>
      {course.areas.map(ar => (
        <div key={ar.k} style={{ display: 'flex', gap: 12, padding: '10px 0', borderTop: '1px solid #ebebeb' }}>
          <div style={{ flexShrink: 0, width: 68, fontWeight: 700, fontSize: 13, color: '#18181b' }}>{ar.k}</div>
          <div style={{ fontSize: 13, color: '#52525b' }}>{ar.v}</div>
        </div>
      ))}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 14, color: '#2563eb', fontSize: 13, fontWeight: 700 }}>
        수업시간 · 상세 보기 →
      </div>
    </div>
  )
}

// ── CourseSheet ───────────────────────────────────────────────────
function CourseSheet({ course, onClose, navigate }: { course: Course; onClose: () => void; navigate: (p: string) => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="course-sheet-overlay" onClick={onClose}>
      <div className="course-sheet-panel" onClick={e => e.stopPropagation()}>

        {/* sticky 핸들 */}
        <div style={{ position: 'sticky', top: 0, background: '#fff', paddingTop: 8, zIndex: 1 }}>
          <div style={{ width: 42, height: 5, background: '#d1d5db', borderRadius: 999, margin: '0 auto' }} />
        </div>

        <div style={{ padding: '16px 22px 28px' }}>

          {/* 뱃지 + × 닫기 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <TypeBadges types={course.types} />
            <button onClick={onClose} style={{ flexShrink: 0, background: '#f4f4f6', border: 'none', width: 32, height: 32, borderRadius: 8, fontSize: 16, color: '#52525b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>

          <div style={{ fontSize: 22, fontWeight: 800, color: '#18181b', letterSpacing: '-0.02em' }}>{course.name}</div>
          <div style={{ fontSize: 14, color: '#52525b', marginTop: 5 }}>{course.sub}</div>

          {/* 상세 단락 */}
          {course.detail.map((para, i) => (
            <p key={i} style={{ fontSize: 14.5, lineHeight: 1.8, color: '#3f3f46', margin: '14px 0 0' }}>{para}</p>
          ))}

          {/* 수업 구성 */}
          <div style={{ fontWeight: 800, fontSize: 14, color: '#18181b', marginTop: 24, paddingBottom: 8, borderBottom: '2px solid #18181b' }}>수업 구성</div>
          {course.areas.map(ar => (
            <div key={ar.k} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid #ebebeb' }}>
              <div style={{ flexShrink: 0, width: 72, fontWeight: 700, fontSize: 14, color: '#18181b' }}>{ar.k}</div>
              <div style={{ fontSize: 14, color: '#52525b' }}>{ar.v}</div>
            </div>
          ))}

          {/* 수업 시간 */}
          <div style={{ fontWeight: 800, fontSize: 14, color: '#18181b', marginTop: 24, paddingBottom: 8, borderBottom: '2px solid #18181b' }}>수업 시간</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {course.times.map(t => (
              <div key={t.d} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f6f8fa', border: '1px solid #dde3ea', borderRadius: 12, padding: '14px 18px' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#52525b', fontWeight: 600 }}>{t.d}</div>
                  <div style={{ fontSize: 11, color: '#8c959f', marginTop: 3 }}>{t.n}</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#18181b' }}>{t.h}</div>
              </div>
            ))}
          </div>

          {/* 수강료 — 상세에서만 */}
          {course.price && (
            <div style={{ marginTop: 12, padding: '14px 18px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#1d4ed8', fontWeight: 700 }}>월 수강료</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#18181b' }}>{course.price}</span>
            </div>
          )}

          {/* CTA */}
          {course.phoneOnly ? (
            <a
              href="tel:01028382391"
              style={{ display: 'block', marginTop: 20, background: '#2563eb', color: '#fff', borderRadius: 11, padding: '15px 0', fontWeight: 700, fontSize: 15, textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}
            >
              전화 상담하기 · 010-2838-2391
            </a>
          ) : (
            <button
              onClick={() => { onClose(); navigate('/apply') }}
              style={{ marginTop: 20, width: '100%', background: '#2563eb', border: 'none', color: '#fff', borderRadius: 11, padding: '15px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
            >
              수강 신청하기
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 섹션 헤더 ─────────────────────────────────────────────────────
function SectionHeader({ title, desc, note }: { title: string; desc: string; note?: string }) {
  return (
    <div style={{ marginTop: 32, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ display: 'block', width: 5, height: 22, borderRadius: 3, background: '#2563eb', flexShrink: 0 }} />
        <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em', color: '#18181b' }}>{title}</span>
      </div>
      {desc && <div style={{ fontSize: 14, color: '#71717a', marginTop: 6, paddingLeft: 14 }}>{desc}</div>}
      {note && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: '10px 0 0 14px', background: '#dbeafe', color: '#1d4ed8', fontSize: 12.5, fontWeight: 700, padding: '7px 12px', borderRadius: 8 }}>
          📅 {note}
        </div>
      )}
    </div>
  )
}

// ── 메인 ─────────────────────────────────────────────────────────
export default function Courses() {
  const navigate = useNavigate()
  const [openCourse, setOpenCourse] = useState<Course | null>(null)

  return (
    <div>

      {/* ── 페이지 헤더 ── */}
      <div style={{ padding: '26px 18px 10px' }}>
        <div className="md:max-w-[1100px] md:mx-auto">
          <div style={{ width: 28, height: 3, background: '#2563eb', borderRadius: 999, marginBottom: 10 }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', letterSpacing: '0.08em' }}>COURSE</div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#18181b', marginTop: 4 }}>수업 소개</div>
        </div>
      </div>

      {/* ── 전형 안내 ── */}
      <div style={{ padding: '8px 18px 0' }}>
        <div className="md:max-w-[1100px] md:mx-auto">
          <div style={{ background: '#f6f8fa', border: '1px solid #d6dde5', borderRadius: 16, padding: 22 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#18181b', marginBottom: 14 }}>디미고 입시는 이렇게 진행됩니다</div>
            {ADMISSION_INFO.map(a => (
              <div key={a.step} style={{ display: 'flex', gap: 14, padding: '12px 0', borderTop: '1px solid #c8d0dc' }}>
                <div style={{ flexShrink: 0, fontWeight: 700, color: '#2563eb', fontSize: 13, width: 60 }}>{a.step}</div>
                <div style={{ fontSize: 14, color: '#3f3f46', lineHeight: 1.6 }}>{a.desc}</div>
              </div>
            ))}
            <div style={{ fontSize: 12, color: '#8c959f', marginTop: 12, lineHeight: 1.6, borderTop: '1px solid #c8d0dc', paddingTop: 12 }}>
              디미고는 전기학교로 전국 1곳만 지원 가능합니다. 일반전형 지원자도 소질적성검사(C언어·정보소양·논리적 사고) 대비가 필요합니다.
            </div>
          </div>
        </div>
      </div>

      {/* ── 수업 카드 — 통합 2열 그리드 ── */}
      <div style={{ padding: '0 18px' }}>
        <div className="md:max-w-[1100px] md:mx-auto">
          {SECTIONS.map(sec => (
            <div key={sec.id}>
              {/* 섹션 헤더 — 항상 전체 너비 */}
              <SectionHeader title={sec.title} desc={sec.desc} note={sec.note} />
              {/* 카드 2열 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14 }}>
                {sec.courses.map(c => (
                  <CourseCard key={c.id} course={c} onClick={() => setOpenCourse(c)} />
                ))}
              </div>
            </div>
          ))}
          <div style={{ height: 32 }} />
        </div>
      </div>

      {/* ── 하단 CTA ── */}
      <div className="dark-cta-bottom" style={{ background: '#18181b', padding: '32px 20px 0', textAlign: 'center' }}>
        <div className="md:max-w-[600px] md:mx-auto">
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>지금 바로 수강 신청하세요</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 6, lineHeight: 1.6 }}>입시 상담 문의 010-2838-2391</div>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => navigate('/apply')}
              className="hover-btn"
              style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 40px', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}
            >
              수강 신청하기
            </button>
            <a href="tel:01028382391" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              전화 상담 010-2838-2391
            </a>
          </div>
          <div style={{ marginTop: 32, paddingTop: 16, paddingBottom: 8, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: '#52525b' }}>
            인코딩플러스 · 디미고 · 특성화고 입시 전문 · 사업자등록번호 110-96-08049
          </div>
        </div>
      </div>

      {openCourse && (
        <CourseSheet course={openCourse} onClose={() => setOpenCourse(null)} navigate={navigate} />
      )}
    </div>
  )
}
