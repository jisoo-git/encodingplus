import { useNavigate, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { label: '홈', path: '/' },
  { label: '수업 소개', path: '/courses' },
  { label: '상담 예약', path: '/consult' },
  { label: '입시 블로그', path: '/blog' },
]

interface Props {
  onMenuOpen: () => void
}

export default function TopNav({ onMenuOpen }: Props) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <>
      {/* 모바일 */}
      <header
        className="flex md:hidden"
        style={{
          position: 'sticky', top: 0, zIndex: 40,
          height: 56,
          background: 'rgba(255,255,255,0.94)',
          backdropFilter: 'blur(10px)',
          borderBottom: "1px solid #c8d0dc",
          alignItems: 'center', justifyContent: 'space-between',
          padding: '0 18px',
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
        >
          <img src="/icon/incodingplus_logo.png" alt="" style={{ height: 28, width: 'auto' }} />
          <span style={{ fontWeight: 800, fontSize: 18, color: '#18181b', letterSpacing: '-0.03em' }}>인코딩플러스</span>
        </button>
        <button
          onClick={onMenuOpen}
          aria-label="메뉴 열기"
          style={{
            background: 'none', border: 'none',
            width: 44, height: 44,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            gap: 4, padding: '0 12px',
          }}
        >
          <span style={{ height: 2, background: '#3f3f46', borderRadius: 2 }} />
          <span style={{ height: 2, background: '#3f3f46', borderRadius: 2 }} />
          <span style={{ height: 2, background: '#3f3f46', borderRadius: 2 }} />
        </button>
      </header>

      {/* 데스크탑 */}
      <header
        className="hidden md:flex"
        style={{
          position: 'sticky', top: 0, zIndex: 40,
          height: 72,
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(10px)',
          borderBottom: "1px solid #c8d0dc",
          alignItems: 'center', justifyContent: 'space-between',
          padding: '0 40px',
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 7, padding: 0 }}
        >
          <img src="/icon/incodingplus_logo.png" alt="" style={{ height: 32, width: 'auto' }} />
          <span style={{ fontWeight: 800, fontSize: 21, color: '#18181b', letterSpacing: '-0.03em' }}>인코딩플러스</span>
        </button>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {NAV_LINKS.map(link => {
            const active = link.path === '/' ? pathname === '/' : pathname.startsWith(link.path)
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={active ? '' : 'nav-btn'}
                style={{
                  background: active ? '#dbeafe' : 'none',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: active ? 700 : 500,
                  color: active ? '#1d4ed8' : '#52525b',
                  padding: '8px 14px',
                  borderRadius: 9,
                  whiteSpace: 'nowrap',
                }}
              >
                {link.label}
              </button>
            )
          })}
          <button
            onClick={() => navigate('/apply')}
            className="hover-btn"
            style={{
              marginLeft: 8,
              background: '#2563eb',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              padding: '9px 20px',
              borderRadius: 10,
              whiteSpace: 'nowrap',
            }}
          >
            수강 신청 →
          </button>
        </nav>
      </header>
    </>
  )
}
