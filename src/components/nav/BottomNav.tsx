import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'

const TABS = [
  { icon: '🏠', label: '홈', path: '/' },
  { icon: '📚', label: '수업', path: '/courses' },
  { icon: '✏️', label: '신청', path: '/apply' },
  { icon: '📝', label: '블로그', path: '/blog' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [showSheet, setShowSheet] = useState(false)

  const handleTabClick = (path: string) => {
    if (path === '/apply') {
      setShowSheet(true)
    } else {
      navigate(path)
    }
  }

  return (
    <>
      <nav
        className="flex md:hidden"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid #c8d0dc',
          zIndex: 30,
        }}
      >
        {TABS.map(tab => {
          const active = tab.path === '/apply'
            ? pathname.startsWith('/apply')
            : tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => handleTabClick(tab.path)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                paddingTop: 6,
              }}
            >
              <span style={{ fontSize: 19, filter: active ? 'none' : 'grayscale(1) opacity(0.45)' }}>
                {tab.icon}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: active ? '#2563eb' : '#a1a1aa' }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* 신청 선택 시트 */}
      {showSheet && (
        <div
          onClick={() => setShowSheet(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(24,24,27,0.45)',
            display: 'flex', alignItems: 'flex-end',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              background: '#fff',
              borderRadius: '20px 20px 0 0',
              padding: '20px 20px calc(24px + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#c8d0dc' }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#18181b', marginBottom: 16, textAlign: 'center' }}>
              신청 유형 선택
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => { setShowSheet(false); navigate('/apply') }}
                style={{
                  width: '100%', padding: '16px', borderRadius: 12,
                  background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>수강 신청</div>
                <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.8, marginTop: 2 }}>입시 단기특강 · 일반전형 특강</div>
              </button>
              <button
                onClick={() => { setShowSheet(false); navigate('/apply?type=seminar') }}
                style={{
                  width: '100%', padding: '16px', borderRadius: 12,
                  background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>설명회 신청</div>
                <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.7, marginTop: 2 }}>매주 토요일 11시</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
