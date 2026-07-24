import { useNavigate } from 'react-router-dom'

export default function DarkCTAFooter() {
  const navigate = useNavigate()

  return (
    <div className="dark-cta-bottom" style={{ background: '#18181b', paddingTop: 32, paddingLeft: 20, paddingRight: 20, textAlign: 'center' }}>
      <div className="md:max-w-[600px] md:mx-auto">
        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>지금 바로 상담·신청하세요</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 6, lineHeight: 1.6 }}>특성화고 입시 No.1</div>
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <a href="tel:01028382391" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            전화 상담 010-2838-2391
          </a>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => navigate('/start')}
              className="hover-btn"
              style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 20px', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
            >
              신청하기
            </button>
            <a
              href="https://pf.kakao.com/_RSYxiT"
              target="_blank" rel="noopener noreferrer"
              className="hover-btn"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FEE500', color: '#18181b', borderRadius: 10, padding: '12px 20px', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
            >
              카카오 채널 상담
            </a>
          </div>
        </div>
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: '#52525b', lineHeight: 1.8 }}>
          경기 안산시 단원구 광덕동로 41 로진프라자 3층 305호<br />
          인코딩플러스 · 디미고 · 특성화고 입시 전문 · 사업자등록번호 110-96-08049
        </div>
      </div>
    </div>
  )
}
