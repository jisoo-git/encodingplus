import { useNavigate } from 'react-router-dom'

// 상담·신청 허브 — 흩어져 있던 세 흐름(상담 예약·수강 신청·설명회 신청)의 단일 진입점.
// 각 카드는 기존 페이지로 그대로 연결한다(슬롯 예약·수강신청 폼·설명회 폼은 손대지 않음).
//
// 이미지 교체: 실제 카드 이미지가 준비되면 아래 CARDS 항목에 image: '/hub/consult.png' 처럼
// /public 경로를 넣으면 그라데이션 플레이스홀더 대신 이미지가 렌더된다.
type HubCard = {
  id: string
  icon: string
  title: string
  desc: string
  cta: string
  to: string
  grad: string
  image?: string
}

const CARDS: HubCard[] = [
  { id: 'consult', icon: '💬', title: '상담 예약', desc: '입시 방향이 궁금하다면', cta: '예약하기', to: '/consult', grad: 'linear-gradient(135deg,#3b82f6,#2563eb)' },
  { id: 'apply', icon: '📝', title: '수강 신청', desc: '바로 등록하고 싶다면', cta: '신청하기', to: '/apply', grad: 'linear-gradient(135deg,#2563eb,#1d4ed8)' },
  { id: 'seminar', icon: '🎤', title: '설명회 신청', desc: '먼저 설명회에 참석하려면', cta: '신청하기', to: '/apply?type=seminar', grad: 'linear-gradient(135deg,#1d4ed8,#1e40af)' },
]

export default function ApplyHub() {
  const navigate = useNavigate()

  return (
    <div className="md:max-w-[860px] md:mx-auto md:px-7">
      <div style={{ padding: '20px 18px 34px' }}>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#2563eb', letterSpacing: '0.04em' }}>상담·신청</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#18181b', marginTop: 8, letterSpacing: '-0.02em' }}>원하시는 방법을 선택하세요</div>
          <div style={{ fontSize: 14, color: '#71717a', marginTop: 8, lineHeight: 1.6 }}>상담 예약 · 수강 신청 · 설명회 신청을 한 곳에서</div>
        </div>

        {/* 카드 격자 — 모바일 1열, 데스크톱 3열 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CARDS.map(card => (
            <button
              key={card.id}
              onClick={() => navigate(card.to)}
              className="hub-card"
              style={{
                background: '#fff',
                border: '1px solid #c8d0dc',
                borderRadius: 16,
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                padding: 0,
                boxShadow: '0 1px 4px rgba(0,55,112,0.05)',
              }}
            >
              {/* 이미지 / 플레이스홀더 */}
              <div style={{ width: '100%', aspectRatio: '16 / 9', background: card.image ? '#eff6ff' : card.grad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.image
                  ? <img src={card.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 42, lineHeight: 1 }}>{card.icon}</span>}
              </div>

              {/* 본문 */}
              <div style={{ padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#18181b' }}>{card.title}</div>
                <div style={{ fontSize: 13, color: '#71717a', marginTop: 6, lineHeight: 1.5 }}>{card.desc}</div>
                <div style={{ marginTop: 'auto', paddingTop: 16, width: '100%' }}>
                  <div style={{ background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14, padding: '11px 0', borderRadius: 10, textAlign: 'center' }}>
                    {card.cta} →
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .hub-card { transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
        .hub-card:hover { transform: translateY(-4px); box-shadow: 0 14px 28px rgba(37,99,235,.15); border-color: #93c5fd; }
      `}</style>
    </div>
  )
}
