import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase/config'
import DarkCTAFooter from '../components/DarkCTAFooter'

interface Banner {
  id: string; badge: string; title: string; sub: string
  bg: string; image?: string; cta: string; link: string; order: number
}


const FALLBACK_BANNERS: Banner[] = [
  { id: '1', image: '/banners/banner1.png', link: '/courses', badge: '', title: '', sub: '', bg: '#001233', cta: '', order: 0 },
  { id: '2', image: '/banners/banner2.png', link: '/courses', badge: '', title: '', sub: '', bg: '#001233', cta: '', order: 1 },
  { id: '3', image: '/banners/banner3.png', link: '/apply',   badge: '', title: '', sub: '', bg: '#001233', cta: '', order: 2 },
  { id: '4', image: '/banners/banner4.png', link: '/apply',   badge: '', title: '', sub: '', bg: '#001233', cta: '', order: 3 },
  { id: '5', image: '/banners/banner5.png', link: '/courses', badge: '', title: '', sub: '', bg: '#001233', cta: '', order: 4 },
]

const STATS = [
  { num: '212명', label: '디미고 9년 누적 합격' },
  { num: '1위', label: '디미고 합격률 전국 1위' },
  { num: '37명', label: '2026 디미고 합격' },
  { num: '9년', label: '디미고 입시 전문' },
]

const WHY_CARDS = [
  {
    num: '01',
    title: '전학과 맞춤',
    sub: '어느 학과를 목표로 해도\n완벽하게 준비합니다',
    desc: '디미고 4개 학과 모두 커버하는 유일한 전문 입시 학원입니다. 학과별 특성에 맞는 코딩 실적물, 자기소개서, 면접까지 맞춤 지도합니다.',
    tags: ['웹프로그래밍', '해킹방어', 'e-비즈니스', '디지털콘텐츠'],
    highlight: null as null | { num: string; label: string },
  },
  {
    num: '02',
    title: '최강 교사진',
    sub: '디미고 출신 선생님\n+ 30년 입시 전문가',
    desc: '직접 디미고를 다닌 선생님이 학교 생활·면접·커리큘럼의 생생한 정보를 전달합니다. 30년 베테랑 입시 선생님이 성적 분석과 전략 컨설팅을 담당합니다.',
    tags: ['디미고 동문 강사', '30년 입시 컨설팅'],
    highlight: null,
  },
  {
    num: '03',
    title: '압도적 실적',
    sub: '9년간 쌓아온 데이터가\n합격을 만듭니다',
    desc: '소질적성검사 기출, 면접 질문 DB, 합격 자기소개서 사례까지 — 9년 동안 축적한 인코딩플러스만의 합격 노하우를 아낌없이 활용합니다.',
    tags: [],
    highlight: { num: '212명', label: '전국 최다 누적 합격생' },
  },
]

const COURSES_PREVIEW = [
  { tag: 'COURSE 01', name: '입시 단기특강', sub: '특별전형과 일반전형 모두 도전 · 16주', items: ['실적물 생산 · 이론 교육', '이산수학 · 정보 · 실전모의고사', '실적설명서 · 자소서 · 면접'], color: '#2563eb', bg: '#eff6ff' },
  { tag: 'COURSE 02', name: '일반전형 특강', sub: '일반전형 집중 전략 · 16주', items: ['소질적성검사 대비', '이산수학 · 컴퓨터 교과', '인성면접 강화'], color: '#2563eb', bg: '#eff6ff' },
]

export default function Home() {
  const navigate = useNavigate()
  const [banners, setBanners] = useState<Banner[]>(FALLBACK_BANNERS)
  const [slide, setSlide] = useState(0)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    getDocs(query(collection(db, 'banners'), orderBy('order')))
      .then(snap => { if (!snap.empty) setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() } as Banner))) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % banners.length), 4500)
    return () => clearInterval(t)
  }, [banners.length])

  const prev = () => setSlide(s => (s - 1 + banners.length) % banners.length)
  const next = () => setSlide(s => (s + 1) % banners.length)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
    touchStartX.current = null
  }

  return (
    <div>

      {/* ══ SECTION 1: 히어로 슬라이더 (이미지 전용) ══ */}
      <div style={{ background: '#fff', padding: '16px 16px 0' }}>
        <div className="md:max-w-[1100px] md:mx-auto">
          <div
            style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 18, overflow: 'hidden' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {banners.map((b, i) => (
              <div
                key={b.id}
                onClick={() => b.link && (b.link.startsWith('http') ? window.open(b.link, '_blank') : navigate(b.link))}
                style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: b.image ? `url(${b.image})` : undefined,
                  background: b.image ? undefined : b.bg,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: i === slide ? 1 : 0,
                  transition: 'opacity 0.45s ease',
                  pointerEvents: i === slide ? 'auto' : 'none',
                  cursor: b.link ? 'pointer' : 'default',
                }}
              />
            ))}

            {/* 화살표 — 우하단 */}
            <button onClick={prev} aria-label="이전 배너" style={{
              position: 'absolute', right: 44, bottom: 14, zIndex: 2,
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(4px)',
              borderRadius: '50%', width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, color: '#fff', cursor: 'pointer',
            }}>‹</button>
            <button onClick={next} aria-label="다음 배너" style={{
              position: 'absolute', right: 10, bottom: 14, zIndex: 2,
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(4px)',
              borderRadius: '50%', width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, color: '#fff', cursor: 'pointer',
            }}>›</button>
          </div>

          {/* 도트 — 버튼으로 교체해 터치 타깃 확보 */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 2, padding: '4px 0 10px' }}>
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`${i + 1}번 배너`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '8px 5px',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                <span style={{
                  display: 'inline-block',
                  width: i === slide ? 20 : 6, height: 6,
                  borderRadius: 999,
                  background: i === slide ? '#2563eb' : '#d4d4d8',
                  transition: 'all 0.3s',
                }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ SECTION 2: 합격 실적 ══ */}
      <div style={{ background: '#fafafa', padding: '52px 0' }}>
        <div className="md:max-w-[1100px] md:mx-auto" style={{ padding: '0 18px' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ width: 28, height: 3, background: '#2563eb', borderRadius: 999, margin: '0 auto 10px' }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: '0.1em', marginBottom: 6 }}>합격 실적</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: '#18181b', marginBottom: 4 }}>9년간 검증된 디미고 합격 실적</div>
            <div style={{ fontSize: 13, color: '#52525b' }}>매년 디미고에 합격생을 배출한 입시 전문 학원입니다</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STATS.map(s => (
              <div
                key={s.label}
                className="hover-card"
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: '20px 12px',
                  textAlign: 'center',
                  border: '1px solid #c8d0dc',
                  boxShadow: '0 1px 4px rgba(0,55,112,0.06)',
                }}
              >
                <div style={{ fontSize: 30, fontWeight: 800, color: '#2563eb', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: 12, color: '#52525b', marginTop: 6, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: '12px 16px', background: '#fff', borderRadius: 10, textAlign: 'center', fontSize: 13, color: '#3f3f46', border: '1px solid #c8d0dc' }}>
            <span style={{ color: '#1d4ed8', fontWeight: 700 }}>선린고 · 단소고</span> 등 서울·경기 특성화고 다수 합격
          </div>
        </div>
      </div>

      {/* ══ SECTION 3: WHY 인코딩플러스 ══ */}
      <div style={{ background: '#fafafa', padding: '52px 0' }}>
        <div className="md:max-w-[1100px] md:mx-auto" style={{ padding: '0 18px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 28, height: 3, background: '#2563eb', borderRadius: 999, margin: '0 auto 10px' }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: '0.1em', marginBottom: 10 }}>WHY 인코딩플러스</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: '#18181b', lineHeight: 1.35 }}>
              9년간 212명 합격생이<br />인코딩플러스를 선택한 이유
            </div>
            <div style={{ fontSize: 14, color: '#71717a', marginTop: 10 }}>디미고 입시, 혼자 준비하기엔 너무 많은 것이 걸려 있습니다.</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ alignItems: 'stretch' }}>
            {WHY_CARDS.map(card => (
              <div
                key={card.num}
                className="hover-card"
                style={{
                  background: '#fff', border: '1px solid #c8d0dc', borderRadius: 16,
                  padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 0,
                  boxShadow: '0 2px 8px rgba(0,55,112,0.07)', height: '100%',
                }}
              >
                {/* 번호 뱃지 */}
                <div style={{
                  width: 38, height: 38, borderRadius: 11, background: '#dbeafe',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#2563eb', letterSpacing: '0.04em' }}>{card.num}</span>
                </div>

                {/* 제목 */}
                <div style={{ fontSize: 19, fontWeight: 800, color: '#18181b', letterSpacing: '-0.02em', marginBottom: 8 }}>
                  {card.title}
                </div>

                {/* 부제 */}
                <div style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', lineHeight: 1.5, marginBottom: 14, whiteSpace: 'pre-line' }}>
                  {card.sub}
                </div>

                {/* 설명 */}
                <div style={{ fontSize: 13, color: '#52525b', lineHeight: 1.7, marginBottom: 18, flex: 1 }}>
                  {card.desc}
                </div>

                {/* 태그 or 하이라이트 */}
                {card.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 4, paddingTop: 16, borderTop: '1px solid #ececef' }}>
                    {card.tags.map(tag => (
                      <span
                        key={tag}
                        style={{ background: '#dbeafe', borderRadius: 6, padding: '5px 9px', fontSize: 12, fontWeight: 700, color: '#1d4ed8', whiteSpace: 'nowrap', flexShrink: 1, minWidth: 0 }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {card.highlight && (
                  <div style={{
                    marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #ececef',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{ fontSize: 30, fontWeight: 800, color: '#2563eb', letterSpacing: '-0.03em', lineHeight: 1 }}>
                      {card.highlight.num}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#71717a', lineHeight: 1.4 }}>
                      {card.highlight.label}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ SECTION 4: 입시 특강 ══ */}
      <div style={{ background: '#fafafa', padding: '52px 0' }}>
        <div className="md:max-w-[1100px] md:mx-auto" style={{ padding: '0 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
            <div>
              <div style={{ width: 28, height: 3, background: '#2563eb', borderRadius: 999, marginBottom: 10 }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: '0.1em', marginBottom: 4 }}>COURSES</div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: '#18181b' }}>입시 특강</div>
            </div>
            <button
              onClick={() => navigate('/courses')}
              className="hover-btn"
              style={{ background: '#2563eb', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, padding: '8px 16px', borderRadius: 10, cursor: 'pointer' }}
            >
              수업 상세 →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COURSES_PREVIEW.map(c => (
              <div
                key={c.name}
                className="hover-card"
                onClick={() => navigate('/courses')}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid #c8d0dc',
                  boxShadow: '0 1px 4px rgba(0,55,112,0.06)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ background: c.bg, borderBottom: `1px solid ${c.color}22`, padding: '18px 20px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c.color, background: `${c.color}18`, padding: '3px 9px', borderRadius: 6 }}>{c.tag}</span>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#18181b', marginTop: 8 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#52525b', marginTop: 3 }}>{c.sub}</div>
                </div>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
                    {c.items.map(item => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: '#3f3f46', fontWeight: 500 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  {/* stopPropagation: 카드 클릭(/courses)과 신청 버튼(/apply) 목적지 충돌 방지 */}
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate('/apply') }}
                    className="hover-btn"
                    style={{ width: '100%', background: c.color, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 14 }}
                  >
                    수강 신청하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ SECTION 5: 설명회 ══ */}
      <div style={{ background: '#fafafa', padding: '52px 0' }}>
        <div className="md:max-w-[1100px] md:mx-auto" style={{ padding: '0 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
            <div>
              <div style={{ width: 28, height: 3, background: '#2563eb', borderRadius: 999, marginBottom: 10 }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: '0.1em', marginBottom: 4 }}>PRESENTATION</div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: '#18181b' }}>설명회</div>
            </div>
          </div>
          <div
            className="hover-card"
            onClick={() => navigate('/apply?type=seminar')}
            style={{
              background: '#fff', borderRadius: 16, overflow: 'hidden',
              border: '1px solid #c8d0dc', boxShadow: '0 1px 4px rgba(0,55,112,0.06)', cursor: 'pointer',
            }}
          >
            <div style={{ background: '#eff6ff', borderBottom: '1px solid #2563eb22', padding: '18px 20px' }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', background: '#2563eb18', padding: '3px 9px', borderRadius: 6 }}>진행 중</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', background: '#dbeafe', padding: '3px 9px', borderRadius: 6 }}>매주 토요일 11시</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#18181b', marginTop: 8 }}>디미고 입시 설명회</div>
              <div style={{ fontSize: 12, color: '#52525b', marginTop: 3 }}>입학 전형 안내 · 합격 전략 · 커리큘럼 소개</div>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
                {['디미고 입학 전형 및 일정 안내', '학과별 소질적성검사 · 면접 전략', '인코딩플러스 수업 커리큘럼 소개'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#3f3f46', fontWeight: 500 }}>{item}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={e => { e.stopPropagation(); navigate('/apply?type=seminar') }}
                className="hover-btn"
                style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
              >
                설명회 신청하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ SECTION 6: 상담 CTA + 푸터 ══ */}
      <DarkCTAFooter />

    </div>
  )
}
