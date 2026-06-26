import { useNavigate } from 'react-router-dom'

// ── 타입 ─────────────────────────────────────────────────────────
type Area = { k: string; v: string }
type TimeSlot = { d: string; h: string; n: string }

interface Course {
  id: string
  types: string[]
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
  note?: string
  courses: Course[]
}

// ── 뱃지 색상 ─────────────────────────────────────────────────────
const TYPE_STYLE: Record<string, { color: string; bg: string }> = {
  '특별전형': { color: '#1d4ed8', bg: '#dbeafe' },
  '일반전형': { color: '#15803d', bg: '#dcfce7' },
}

// ── 데이터 ────────────────────────────────────────────────────────
const SECTIONS: CourseSection[] = [
  {
    id: 'dimigo',
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

// ── CourseFullCard ─────────────────────────────────────────────────
function CourseFullCard({ course, navigate }: { course: Course; navigate: (p: string) => void }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #d6dde5', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,55,112,0.08)' }}>

      {/* 상단 — 이름·뱃지·설명 */}
      <div style={{ padding: '24px 24px 20px' }}>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
          {course.types.map(t => {
            const s = TYPE_STYLE[t]
            if (!s) return null
            return (
              <span key={t} style={{ fontSize: 12, fontWeight: 700, color: s.color, background: s.bg, padding: '4px 10px', borderRadius: 6 }}>
                {t}
              </span>
            )
          })}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#18181b', letterSpacing: '-0.02em' }}>{course.name}</div>
        <div style={{ fontSize: 14, color: '#52525b', marginTop: 4, marginBottom: 14 }}>{course.sub}</div>
        {course.detail.map((para, i) => (
          <div key={i} style={{ fontSize: 14, lineHeight: 1.75, color: '#3f3f46' }}>{para}</div>
        ))}
      </div>

      {/* 구분선 */}
      <div style={{ borderTop: '1px solid #ececef' }} />

      {/* 수업 구성 */}
      <div style={{ padding: '20px 24px' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#18181b', marginBottom: 10 }}>수업 구성</div>
        {course.areas.map((ar, i) => (
          <div key={ar.k} style={{ display: 'flex', gap: 14, padding: '10px 0', borderTop: i === 0 ? '1px solid #ebebeb' : '1px solid #ebebeb' }}>
            <div style={{ flexShrink: 0, width: 76, fontWeight: 700, fontSize: 13, color: '#18181b' }}>{ar.k}</div>
            <div style={{ fontSize: 13, color: '#52525b' }}>{ar.v}</div>
          </div>
        ))}
      </div>

      {/* 구분선 */}
      <div style={{ borderTop: '1px solid #ececef' }} />

      {/* 수업 시간 */}
      <div style={{ padding: '20px 24px' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#18181b', marginBottom: 10 }}>수업 시간</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {course.times.map(t => (
            <div key={t.d} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f6f8fa', border: '1px solid #dde3ea', borderRadius: 12, padding: '12px 16px' }}>
              <div>
                <div style={{ fontSize: 13, color: '#52525b', fontWeight: 600 }}>{t.d}</div>
                <div style={{ fontSize: 11, color: '#8c959f', marginTop: 2 }}>{t.n}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#18181b' }}>{t.h}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 수강료 + CTA */}
      <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {course.price && (
          <div style={{ padding: '14px 18px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#1d4ed8', fontWeight: 700 }}>월 수강료</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#18181b' }}>{course.price}</span>
          </div>
        )}
        {course.phoneOnly ? (
          <a
            href="tel:01028382391"
            style={{ display: 'block', background: '#2563eb', color: '#fff', borderRadius: 11, padding: '15px 0', fontWeight: 700, fontSize: 15, textAlign: 'center', textDecoration: 'none' }}
          >
            전화 상담하기 · 010-2838-2391
          </a>
        ) : (
          <button
            onClick={() => navigate('/apply')}
            style={{ width: '100%', background: '#2563eb', border: 'none', color: '#fff', borderRadius: 11, padding: '15px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
          >
            수강 신청하기
          </button>
        )}
      </div>
    </div>
  )
}

// ── 메인 ─────────────────────────────────────────────────────────
export default function Courses() {
  const navigate = useNavigate()

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

      {/* ── 수업 카드 ── */}
      <div style={{ padding: '8px 18px 0' }}>
        <div className="md:max-w-[1100px] md:mx-auto">
          {SECTIONS.map(sec => (
            <div key={sec.id}>
              {sec.note && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: '16px 0 14px', background: '#dbeafe', color: '#1d4ed8', fontSize: 12.5, fontWeight: 700, padding: '7px 12px', borderRadius: 8 }}>
                  📅 {sec.note}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16, alignItems: 'start' }}>
                {sec.courses.map(c => (
                  <CourseFullCard key={c.id} course={c} navigate={navigate} />
                ))}
              </div>
            </div>
          ))}
          <div style={{ height: 32 }} />
        </div>
      </div>

      {/* ── 하단 CTA ── */}
      <div style={{ background: '#18181b', padding: '32px 20px 0', textAlign: 'center' }}>
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

    </div>
  )
}
