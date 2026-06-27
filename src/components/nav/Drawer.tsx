import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const MENU_ITEMS = [
  { label: '홈', path: '/' },
  { label: '수업 소개', path: '/courses' },
  { label: '수강 신청', path: '/apply' },
  { label: '입시 블로그', path: '/blog' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function Drawer({ open, onClose }: Props) {
  const navigate = useNavigate()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const go = (path: string) => {
    navigate(path)
    onClose()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(24,24,27,0.45)',
        display: 'flex', justifyContent: 'flex-end',
        animation: 'drawerFadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '76%', maxWidth: 300,
          height: '100%',
          background: '#fff',
          padding: '22px 20px',
          display: 'flex', flexDirection: 'column',
          animation: 'drawerSlideIn 0.25s ease',
          borderLeft: '1px solid #c8d0dc',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#18181b', letterSpacing: '-0.02em' }}>인코딩플러스<span style={{ color: '#2563eb' }}>+</span></span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 22, color: '#8c959f', lineHeight: 1, padding: 4, borderRadius: 6, cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1 }}>
          {MENU_ITEMS.map(item => (
            <button
              key={item.path}
              onClick={() => go(item.path)}
              className="nav-btn"
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                width: '100%', textAlign: 'left',
                background: 'none', border: 'none',
                padding: '15px 8px',
                borderBottom: '1px solid #c8d0dc',
                fontSize: 15, fontWeight: 600, color: '#3f3f46',
                borderRadius: 0,
              }}
            >
              <span>{item.label}</span>
              <span style={{ color: '#d4d4d8', fontSize: 16 }}>›</span>
            </button>
          ))}
        </div>

        <div style={{ paddingTop: 20, borderTop: '1px solid #c8d0dc' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8c959f', letterSpacing: '0.06em', marginBottom: 6 }}>상담 문의</div>
          <a
            href="tel:01028382391"
            style={{ fontWeight: 800, fontSize: 20, color: '#2563eb', textDecoration: 'none', display: 'block' }}
          >
            010-2838-2391
          </a>
        </div>
      </div>

      <style>{`
        @keyframes drawerFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes drawerSlideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
        .nav-btn:hover { background: #f6f9fc !important; color: #1d4ed8 !important; }
      `}</style>
    </div>
  )
}
