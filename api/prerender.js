// 봇(검색엔진·AI 크롤러·링크 미리보기 스크래퍼) 전용 프리렌더.
// vercel.json 의 user-agent 조건부 rewrite 로만 진입한다 — 일반 방문자는 기존 SPA 그대로.
// 공개 콘텐츠(발행된 블로그 글·페이지 소개)만 렌더하며, 개인정보 컬렉션은 조회하지 않는다.
import MarkdownIt from 'markdown-it'

const ORIGIN = 'https://home.in-coding.com'
const FIRESTORE = 'https://firestore.googleapis.com/v1/projects/form-pwa-academy/databases/(default)/documents'

// html:false(기본값) — 마크다운 안의 원시 HTML 은 이스케이프되어 그대로 텍스트로 출력된다.
// 클라이언트 react-markdown 도 원시 HTML 을 렌더하지 않으므로 동작이 일치한다.
const md = new MarkdownIt({ linkify: true })

const esc = s => String(s ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;')

// Firestore REST 응답의 typed value 를 평범한 JS 값으로 변환
function flat(v) {
  if (v == null || typeof v !== 'object') return v
  if ('stringValue' in v) return v.stringValue
  if ('booleanValue' in v) return v.booleanValue
  if ('integerValue' in v) return Number(v.integerValue)
  if ('doubleValue' in v) return v.doubleValue
  if ('timestampValue' in v) return v.timestampValue
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields ?? {}).map(([k, x]) => [k, flat(x)]))
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(flat)
  return null
}

function docToPost(d) {
  const f = Object.fromEntries(Object.entries(d.fields ?? {}).map(([k, v]) => [k, flat(v)]))
  return { id: d.name.split('/').pop(), ...f }
}

async function fetchPost(id) {
  const r = await fetch(`${FIRESTORE}/blogPosts/${encodeURIComponent(id)}`)
  if (!r.ok) return null
  return docToPost(await r.json())
}

async function fetchPosts() {
  const r = await fetch(`${FIRESTORE}/blogPosts?pageSize=200`)
  if (!r.ok) return []
  const data = await r.json()
  return (data.documents ?? []).map(docToPost)
    .filter(p => p.published !== false)
    .sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')))
}

// 공통 HTML 셸 — 페이지별 title/description/canonical/OG/JSON-LD 를 채워 완전한 문서를 만든다
function page({ title, description, path, ogImage, ogType = 'website', jsonLd, body }) {
  const canonical = ORIGIN + path
  const image = ogImage ? (ogImage.startsWith('http') ? ogImage : ORIGIN + ogImage) : `${ORIGIN}/banners/banner1.png`
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="${esc(ogType)}">
<meta property="og:site_name" content="인코딩플러스">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(image)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(image)}">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>
<body>
${body}
<footer>
<p><a href="${ORIGIN}/">홈</a> · <a href="${ORIGIN}/courses">수업 안내</a> · <a href="${ORIGIN}/blog">입시 블로그</a> · <a href="${ORIGIN}/start">상담·신청</a></p>
<p>인코딩플러스 — 디미고·특성화고 입시 전문 학원 · 상담문의 031-8042-2391</p>
</footer>
</body>
</html>`
}

const ORG_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: '인코딩플러스',
  url: ORIGIN + '/',
  logo: `${ORIGIN}/icon/incodingplus_logo.png`,
  telephone: '031-8042-2391',
  description: '디미고·특성화고 입시 전문 학원. 9년 누적 212명 합격, 2026학년도 디미고 37명 합격.',
  sameAs: ['https://blog.naver.com/incodingplus'],
}

function homePage() {
  return page({
    title: '인코딩플러스 — 디미고 합격률 전국 1위',
    description: '9년 누적 212명 합격. 디미고 4개 학과 전문 입시 학원. 코딩·자소서·면접까지 한 번에.',
    path: '/',
    jsonLd: ORG_JSONLD,
    body: `<main>
<h1>인코딩플러스 — 디미고·특성화고 입시 전문 학원</h1>
<p>디미고(한국디지털미디어고등학교) 입시를 9년간 지도해 온 전문 학원입니다. 코딩 실적물 제작부터 실적설명서, 자기소개서, 면접까지 한 번에 준비합니다.</p>
<ul>
<li>디미고 9년 누적 합격 212명 — 전국 최다</li>
<li>2026학년도 디미고 합격 37명</li>
<li>디미고 4개 학과(웹프로그래밍·해킹방어·e-비즈니스·디지털콘텐츠) 전 학과 대비</li>
<li>디미고 출신 선생님 + 30년 경력 입시 전문 선생님</li>
</ul>
<h2>수업</h2>
<ul>
<li><a href="${ORIGIN}/courses">입시 단기특강 — 특별전형·일반전형 병행 (16주)</a></li>
<li><a href="${ORIGIN}/courses">일반전형 특강 — 소질적성검사·면접 집중 (16주)</a></li>
</ul>
<h2>바로가기</h2>
<ul>
<li><a href="${ORIGIN}/blog">입시 블로그 — 디미고 입시 정보와 합격 노하우</a></li>
<li><a href="${ORIGIN}/consult">상담 예약</a></li>
<li><a href="${ORIGIN}/apply">수강 신청</a></li>
</ul>
</main>`,
  })
}

async function blogListPage() {
  const posts = await fetchPosts()
  const items = posts.map(p => `<li>
<a href="${ORIGIN}/blog/${esc(p.id)}"><strong>${esc(p.title)}</strong></a>
${p.tag ? ` <span>#${esc(p.tag)}</span>` : ''}
<p>${esc(p.excerpt ?? '')}</p>
<p><time datetime="${esc(p.date ?? '')}">${esc(p.date ?? '')}</time></p>
</li>`).join('\n')
  return page({
    title: '인코딩플러스 — 입시 블로그',
    description: '디미고·특성화고 입시 정보와 합격 노하우',
    path: '/blog',
    body: `<main>
<h1>입시 블로그</h1>
<p>디미고·특성화고 입시 정보와 합격 노하우</p>
<ul>
${items}
</ul>
</main>`,
  })
}

async function blogPostPage(id) {
  const post = await fetchPost(id)
  if (!post || post.published === false || typeof post.content !== 'string') return null
  const description = post.excerpt || String(post.content).slice(0, 140)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description,
    datePublished: post.date,
    image: post.coverImage ? ORIGIN + post.coverImage : undefined,
    url: `${ORIGIN}/blog/${post.id}`,
    author: { '@type': 'Organization', name: '인코딩플러스' },
    publisher: { '@type': 'Organization', name: '인코딩플러스', logo: { '@type': 'ImageObject', url: `${ORIGIN}/icon/incodingplus_logo.png` } },
  }
  return page({
    title: `${post.title} | 인코딩플러스 입시 블로그`,
    description,
    path: `/blog/${post.id}`,
    ogImage: post.coverImage,
    ogType: 'article',
    jsonLd,
    body: `<main>
<article>
<p>${post.tag ? `#${esc(post.tag)} · ` : ''}<time datetime="${esc(post.date ?? '')}">${esc(post.date ?? '')}</time> · 인코딩플러스</p>
${post.coverImage ? `<img src="${esc(ORIGIN + post.coverImage)}" alt="${esc(post.title)}">` : ''}
${md.render(String(post.content))}
</article>
<p><a href="${ORIGIN}/blog">← 입시 블로그 목록</a></p>
</main>`,
  })
}

// 정적 안내 페이지들 — 실제 화면과 같은 내용의 요약본
const STATIC_PAGES = {
  '/courses': {
    title: '인코딩플러스 — 수업 안내',
    description: '디미고 입시 대비 수업 — 입시 단기특강(특별전형+일반전형 병행), 일반전형 특강(소질적성검사·면접).',
    body: `<main>
<h1>수업 안내</h1>
<h2>입시 단기특강</h2>
<p>특별전형과 일반전형을 모두 준비하는 16주 과정. 실적물 생산·이론 교육, 이산수학·정보·실전모의고사, 실적설명서·자기소개서·면접 대비.</p>
<h2>일반전형 특강</h2>
<p>일반전형 집중 전략 16주 과정. 소질적성검사 대비, 이산수학·컴퓨터 교과, 인성면접 강화.</p>
<p><a href="${ORIGIN}/apply">수강 신청하기</a> · <a href="${ORIGIN}/consult">상담 예약하기</a></p>
</main>`,
  },
  '/start': {
    title: '인코딩플러스 — 상담·신청',
    description: '상담 예약과 수강 신청을 한 곳에서.',
    body: `<main>
<h1>상담·신청</h1>
<ul>
<li><a href="${ORIGIN}/consult">상담 예약 — 개인별 상황에 맞는 입시 상담</a></li>
<li><a href="${ORIGIN}/apply">수강 신청 — 체계적인 수업으로 원하는 결과를 준비</a></li>
</ul>
</main>`,
  },
  '/apply': {
    title: '인코딩플러스 — 수강신청',
    description: '인코딩플러스 수강 신청 — 입시 단기특강·일반전형 특강.',
    body: `<main>
<h1>수강 신청</h1>
<p>입시 단기특강, 일반전형 특강 온라인 신청 페이지입니다. 신청은 웹사이트에서 직접 진행해 주세요.</p>
<p><a href="${ORIGIN}/courses">수업 안내 보기</a></p>
</main>`,
  },
  '/consult': {
    title: '인코딩플러스 — 상담 예약',
    description: '인코딩플러스 입시 상담 예약 — 원하는 날짜·시간대를 선택해 예약할 수 있습니다.',
    body: `<main>
<h1>상담 예약</h1>
<p>디미고·특성화고 입시 상담을 예약할 수 있습니다. 예약은 웹사이트에서 직접 진행해 주세요. 전화 상담문의: 031-8042-2391</p>
</main>`,
  },
}

function notFoundPage() {
  return page({
    title: '인코딩플러스 — 페이지를 찾을 수 없습니다',
    description: '요청하신 페이지를 찾을 수 없습니다.',
    path: '/',
    body: '<main><h1>페이지를 찾을 수 없습니다</h1></main>',
  })
}

export default async function handler(req, res) {
  try {
    const raw = (req.query && req.query.path) || '/'
    const path = ('/' + String(Array.isArray(raw) ? raw.join('/') : raw)).replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/'

    let status = 200
    let html
    if (path === '/') html = homePage()
    else if (path === '/blog') html = await blogListPage()
    else if (/^\/blog\/[A-Za-z0-9_-]+$/.test(path)) {
      html = await blogPostPage(path.split('/')[2])
      if (!html) { status = 404; html = notFoundPage() }
    } else if (STATIC_PAGES[path]) {
      html = page({ ...STATIC_PAGES[path], path })
    } else {
      status = 404
      html = notFoundPage()
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    // CDN 캐시로 봇 트래픽의 Firestore 읽기 비용을 방어한다 (10분 캐시 + 하루 stale 허용)
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400')
    res.setHeader('X-Robots-Tag', status === 404 ? 'noindex' : 'all')
    res.status(status).send(html)
  } catch (e) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.status(500).send('prerender error')
  }
}
