import { useEffect } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'

const ADMIN_TABS = [
  { label: '신청현황', path: '/admin/submissions' },
  { label: '폼 편집', path: '/admin/builder' },
  { label: '홍보배너', path: '/admin/banners' },
  { label: '블로그', path: '/admin/blog' },
]

const BOTTOM_TABS = [
  { icon: '📋', label: '신청현황', path: '/admin/submissions' },
  { icon: '📝', label: '폼 편집', path: '/admin/builder' },
  { icon: '🖼️', label: '홍보배너', path: '/admin/banners' },
  { icon: '✏️', label: '블로그', path: '/admin/blog' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ minHeight: '100vh', background: '#fff', position: 'relative' }}>

        {/* ── 모바일 TopNav ── */}
        <header
          className="flex md:hidden"
          style={{
            position: 'sticky', top: 0, zIndex: 50,
            height: 56,
            background: 'rgba(255,255,255,0.94)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #c8d0dc',
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
          <span style={{ fontSize: 11, color: '#1d4ed8', background: '#dbeafe', padding: '3px 8px', borderRadius: 5, fontWeight: 700 }}>관리자</span>
        </header>

        {/* ── 데스크탑 TopNav ── */}
        <header
          className="hidden md:flex"
          style={{
            position: 'sticky', top: 0, zIndex: 50,
            height: 72,
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #c8d0dc',
            alignItems: 'center', justifyContent: 'space-between',
            padding: '0 40px',
          }}
        >
          {/* 로고 */}
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 7, padding: 0 }}
          >
            <img src="/icon/incodingplus_logo.png" alt="" style={{ height: 32, width: 'auto' }} />
            <span style={{ fontWeight: 800, fontSize: 21, color: '#18181b', letterSpacing: '-0.03em' }}>인코딩플러스</span>
            <span style={{ fontSize: 11, color: '#1d4ed8', background: '#dbeafe', padding: '3px 8px', borderRadius: 5, fontWeight: 700, marginLeft: 2 }}>관리자</span>
          </button>

          {/* 오른쪽 탭 + 홈으로 */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {ADMIN_TABS.map(tab => {
              const active = pathname.startsWith(tab.path)
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={active ? '' : 'nav-btn'}
                  style={{
                    background: active ? '#dbeafe' : 'none',
                    border: 'none',
                    color: active ? '#1d4ed8' : '#52525b',
                    fontSize: 15,
                    fontWeight: active ? 700 : 500,
                    padding: '8px 14px',
                    borderRadius: 9,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
            <button
              onClick={() => navigate('/')}
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
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              홈으로
            </button>
          </nav>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="pb-16 md:pb-0">
          <Outlet />
        </main>

        {/* ── 모바일 하단 탭 ── */}
        <nav
          className="flex md:hidden"
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            height: 64,
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid #c8d0dc',
            zIndex: 30,
          }}
        >
          {BOTTOM_TABS.map(tab => {
            const active = pathname.startsWith(tab.path)
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                style={{
                  flex: 1, background: 'none', border: 'none',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 3, paddingTop: 6, cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 18, filter: active ? 'none' : 'grayscale(1) opacity(0.45)' }}>
                  {tab.icon}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: active ? '#2563eb' : '#a1a1aa' }}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </nav>

      </div>
    </div>
  )
}
