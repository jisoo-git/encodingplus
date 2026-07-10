// GA4 페이지뷰 수동 추적 유틸
// index.html gtag 설정에서 send_page_view:false 로 자동 페이지뷰를 끄고,
// SPA 라우트 변경마다 정확한 경로·제목으로 page_view 이벤트를 직접 전송한다.
// (자동 history 추적을 쓰면 제목이 이전 페이지 기준으로 잡히는 문제가 있어 수동 전송)

export const GA_MEASUREMENT_ID = 'G-CD0M92BDB5'

type GtagFn = (...args: unknown[]) => void

function getGtag(): GtagFn | null {
  const w = window as unknown as { gtag?: GtagFn }
  return typeof w.gtag === 'function' ? w.gtag : null
}

// 경로 → 사람이 읽는 페이지 제목 매핑
// 홈은 index.html 의 SEO 제목을 그대로 유지한다.
export function resolvePageTitle(pathname: string): string {
  const base = '인코딩플러스'
  if (pathname === '/') return '인코딩플러스 — 디미고 합격률 전국 1위'
  if (pathname === '/courses') return `${base} — 수업 안내`
  if (pathname === '/start') return `${base} — 상담·신청`
  if (pathname === '/apply') return `${base} — 수강신청`
  if (pathname === '/consult') return `${base} — 상담 예약`
  if (pathname === '/blog') return `${base} — 입시 블로그`
  if (pathname.startsWith('/blog/')) return `${base} — 입시 블로그 글`
  if (pathname === '/admin/login') return `${base} — 관리자 로그인`
  if (pathname.startsWith('/admin')) return `${base} — 관리자`
  return base
}

// 라우트 변경 시 canonical·OG 태그를 현재 경로로 갱신 (JS 를 렌더링하는 크롤러용 SEO 보정.
// JS 를 실행하지 않는 봇은 vercel.json rewrite → api/prerender.js 가 올바른 태그를 응답한다)
function syncSeoTags(pathname: string, title: string): void {
  const url = window.location.origin + pathname
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', url)
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', url)
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title)
}

// 라우트 변경 시 호출. document.title 도 함께 갱신해 브라우저 탭·GA 제목을 일치시킨다.
export function trackPageView(pathname: string, search = ''): void {
  const title = resolvePageTitle(pathname)
  document.title = title
  syncSeoTags(pathname, title)

  const gtag = getGtag()
  if (!gtag) return

  gtag('event', 'page_view', {
    page_title: title,
    page_path: pathname + search,
    page_location: window.location.origin + pathname + search,
    send_to: GA_MEASUREMENT_ID,
  })
}
