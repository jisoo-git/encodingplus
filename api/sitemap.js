// 동적 sitemap.xml — 정적 경로 + Firestore 의 발행된 블로그 글을 합쳐 생성한다.
// vercel.json rewrite: /sitemap.xml → /api/sitemap (기존 정적 public/sitemap.xml 은 제거됨)
const ORIGIN = 'https://home.in-coding.com'
const FIRESTORE = 'https://firestore.googleapis.com/v1/projects/form-pwa-academy/databases/(default)/documents'

const STATIC_URLS = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/courses', changefreq: 'monthly', priority: '0.8' },
  { loc: '/apply', changefreq: 'weekly', priority: '0.8' },
  { loc: '/consult', changefreq: 'weekly', priority: '0.8' },
  { loc: '/start', changefreq: 'monthly', priority: '0.7' },
  { loc: '/blog', changefreq: 'weekly', priority: '0.7' },
]

export default async function handler(req, res) {
  let posts = []
  try {
    const r = await fetch(`${FIRESTORE}/blogPosts?pageSize=200`)
    if (r.ok) {
      const data = await r.json()
      posts = (data.documents ?? [])
        .map(d => {
          const f = d.fields ?? {}
          return {
            id: d.name.split('/').pop(),
            date: f.date?.stringValue ?? '',
            published: f.published?.booleanValue,
          }
        })
        .filter(p => p.published !== false)
    }
  } catch {
    // Firestore 조회 실패 시에도 정적 경로만으로 sitemap 을 응답한다
  }

  const urls = [
    ...STATIC_URLS.map(u => `  <url>
    <loc>${ORIGIN}${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`),
    ...posts.map(p => `  <url>
    <loc>${ORIGIN}/blog/${p.id}</loc>${/^\d{4}-\d{2}-\d{2}$/.test(p.date) ? `
    <lastmod>${p.date}</lastmod>` : ''}
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`),
  ]

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`)
}
