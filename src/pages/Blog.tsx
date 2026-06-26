import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase/config'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import type { Post } from '../types'

export const FALLBACK_POSTS: Post[] = [
  {
    id: 'post-1',
    tag: '특별전형',
    title: '디미고 입시, 특별전형과 일반전형 차이를 정확히 알자',
    date: '2026-06-20',
    read: '4분',
    excerpt: '디미고는 특별전형(특전)과 일반전형(일전)으로 나뉩니다. 두 전형의 차이와 어떤 학생에게 어떤 전형이 유리한지 정리했습니다.',
    coverImage: 'https://picsum.photos/seed/dimigo1/800/450',
    content: `디미고(한국디지털미디어고등학교)는 IT 특성화고 중 최고 명문으로 꼽힙니다. 전국 단일 학교로 전기학교로 분류되며, 전국 어디서나 지원 가능합니다.

디미고 입시는 크게 두 가지 전형으로 나뉩니다. **특별전형(이하 특전)**과 **일반전형(이하 일전)**입니다.

## 특별전형

특전은 방과후학교 실적물을 제출하고 서류 심사와 면접으로 평가받습니다. IT 관련 프로젝트나 코딩 활동 경험이 있는 학생에게 유리합니다.

## 일반전형

일전은 소질적성검사를 통해 평가합니다. C언어, 정보소양, 논리적 사고 세 영역을 시험으로 측정하며, 코딩을 처음 시작하는 학생도 준비할 수 있습니다.

어떤 전형이 맞는지 모르겠다면 상담을 먼저 받아보시길 권장합니다. 학생의 현재 수준과 목표에 따라 전략이 달라집니다.`,
  },
  {
    id: 'post-2',
    tag: '실적물',
    title: '특별전형 실적물, 어떻게 준비해야 할까?',
    date: '2026-06-15',
    read: '5분',
    excerpt: '특전 합격의 핵심은 실적물입니다. 어떤 내용이 좋은 실적물인지, 어떻게 구성해야 하는지 알아봅니다.',
    coverImage: 'https://picsum.photos/seed/dimigo2/800/450',
    content: `특별전형에서 실적물은 당락을 결정하는 핵심 요소입니다. 단순한 코딩 결과물보다는 "왜 이 프로젝트를 했는가"에 대한 스토리가 중요합니다.

## 좋은 실적물의 3가지 요소

1. **창의적인 아이디어** — 기존에 없는 문제를 발견하고 해결
2. **구현 가능한 코드** — 실제로 동작하는 프로그램
3. **명확한 문제 해결 의도** — 왜 만들었는지 설명 가능

## 일정

실적물 주제는 7월에 결정하고 8월 내에 완성하는 것이 이상적입니다. 9월 이후에는 이론 학습과 면접 준비에 집중해야 합니다.

인코딩플러스에서는 7월부터 실적물 주제 선정을 함께하고, 매주 토요일 6시간 수업을 통해 완성도를 높여나갑니다.`,
  },
  {
    id: 'post-3',
    tag: '소질적성',
    title: '소질적성검사, 무엇을 어떻게 공부해야 할까?',
    date: '2026-06-10',
    read: '6분',
    excerpt: '일반전형의 핵심인 소질적성검사는 C언어, 정보소양, 논리적 사고 세 영역으로 구성됩니다. 각 영역별 효과적인 대비법을 정리했습니다.',
    coverImage: 'https://picsum.photos/seed/dimigo3/800/450',
    content: `소질적성검사는 일반전형 지원자라면 반드시 통과해야 하는 관문입니다. 매년 10월에 시행되며 세 영역을 평가합니다.

## C언어

기본 문법과 알고리즘 문제가 출제됩니다. for/while 반복문, 조건문, 배열, 함수를 중점적으로 학습해야 합니다.

## 정보소양

컴퓨터 기본 개념, 자료구조, 진법 변환 등을 다룹니다. 이론 암기보다는 **원리 이해**가 더 중요합니다.

## 논리적 사고

수학적 사고력을 측정합니다. 수열, 도형 패턴, 논리 추론 등의 문제가 나옵니다.

7월부터 시작해 10월까지 **16주** 동안 체계적으로 학습하면 충분히 준비할 수 있습니다.`,
  },
]

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', border: '1px solid #d4d9e0', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ height: 150, background: '#f0f1f4' }} />
      <div style={{ padding: '16px 18px 18px' }}>
        {[40, '90%', '70%', '100%', '80%'].map((w, i) => (
          <div key={i} style={{ height: i < 1 ? 14 : i < 3 ? 16 : 13, width: w, background: '#f6f9fc', borderRadius: 6, marginBottom: i === 4 ? 0 : 10, marginTop: i === 0 ? 0 : undefined }} />
        ))}
      </div>
    </div>
  )
}

function BlogCard({ post, onClick }: { post: Post; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="hover-card"
      style={{
        background: '#fff',
        border: '1px solid #d4d9e0',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 대표 이미지 — 고정 150px */}
      <div style={{ height: 150, flexShrink: 0, background: '#f0f1f4', overflow: 'hidden' }}>
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
      </div>

      {/* 콘텐츠 */}
      <div style={{ flex: 1, padding: '14px 16px 14px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', marginBottom: 6, letterSpacing: '0.04em', flexShrink: 0 }}>
          #{post.tag}
        </div>
        <div style={{
          fontSize: 15, fontWeight: 800, color: '#18181b', lineHeight: 1.4,
          letterSpacing: '-0.02em',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          marginBottom: 8, flexShrink: 0,
          minHeight: '42px',
        }}>
          {post.title}
        </div>
        {/* 요약 */}
        <div style={{
          flex: 1,
          fontSize: 13, color: '#71717a', lineHeight: 1.55,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
        }}>
          {post.excerpt}
        </div>
        {/* 날짜/조회수 — 항상 카드 하단 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid #f0f0f0', fontSize: 12, color: '#a1a1aa', fontWeight: 500, flexShrink: 0 }}>
          <span>{post.date}</span>
          <span>조회수 {post.views ?? 0}</span>
        </div>
      </div>
    </div>
  )
}

export default function Blog() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const q = query(collection(db, 'blogPosts'), orderBy('date', 'desc'))
        const snapshot = await getDocs(q)
        if (snapshot.empty) {
          setPosts(FALLBACK_POSTS)
        } else {
          const all = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Post, 'id'>) }))
          setPosts(all.filter(p => p.published !== false))
        }
      } catch {
        setPosts(FALLBACK_POSTS)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const pinnedPosts = posts.filter(p => p.pinned).slice(0, 3)
  const regularPosts = posts.filter(p => !p.pinned)

  return (
    <div>
      {/* 헤더 */}
      <div style={{ background: '#fff', padding: '26px 18px 10px' }}>
        <div className="md:max-w-[1100px] md:mx-auto">
          <div style={{ width: 28, height: 3, background: '#2563eb', borderRadius: 999, marginBottom: 10 }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', letterSpacing: '0.08em' }}>BLOG</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#18181b', letterSpacing: '-0.03em', marginTop: 4 }}>입시 블로그</div>
          <div style={{ fontSize: 14, color: '#71717a', marginTop: 8 }}>디미고·특성화고 입시 정보와 합격 노하우</div>
        </div>
      </div>

      {/* 목록 */}
      <div className="blog-list-bottom" style={{ background: '#fff', padding: '14px 18px 0' }}>
        <div className="md:max-w-[1100px] md:mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 14, gridAutoRows: '1fr' }}>
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#8c959f', fontSize: 14 }}>
              글이 없습니다
            </div>
          ) : (
            <>
              {/* 고정 글 */}
              {pinnedPosts.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>📌 고정 글</span>
                    <span style={{ fontSize: 12, color: '#a1a1aa' }}>{pinnedPosts.length}개</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 14, gridAutoRows: '1fr' }}>
                    {pinnedPosts.map(post => (
                      <div key={post.id} style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1, background: '#2563eb', borderRadius: 5, padding: '2px 6px', fontSize: 11 }}>📌</div>
                        <BlogCard post={post} onClick={() => navigate(`/blog/${post.id}`)} />
                      </div>
                    ))}
                  </div>
                  <div style={{ borderBottom: '1px solid #c8d0dc', marginTop: 24 }} />
                </div>
              )}

              {/* 전체 글 */}
              {pinnedPosts.length > 0 && regularPosts.length > 0 && (
                <div style={{ fontSize: 13, fontWeight: 700, color: '#52525b', marginBottom: 12 }}>전체 글</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 14, gridAutoRows: '1fr' }}>
                {regularPosts.map(post => (
                  <BlogCard key={post.id} post={post} onClick={() => navigate(`/blog/${post.id}`)} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
