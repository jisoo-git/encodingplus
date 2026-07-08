import { useNavigate, useLocation } from 'react-router-dom'

const TABS = [
  { icon: '🏠', label: '홈', path: '/' },
  { icon: '📚', label: '수업', path: '/courses' },
  { icon: '✏️', label: '신청', path: '/start' },
  { icon: '📝', label: '블로그', path: '/blog' },
]

// '신청' 탭은 상담·신청 허브(/start)와 그 하위 흐름(/apply·/consult) 어디에 있어도 활성.
const APPLY_FAMILY = ['/start', '/apply', '/consult']

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
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
        const active = tab.path === '/start'
          ? APPLY_FAMILY.some(p => pathname === p || pathname.startsWith(p + '/'))
          : tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path)
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
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
  )
}
