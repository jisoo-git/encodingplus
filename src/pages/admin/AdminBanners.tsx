import { useEffect, useState } from 'react'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query, writeBatch,
} from 'firebase/firestore'
import { db } from '../../firebase/config'

interface Banner {
  id: string
  badge: string
  title: string
  sub: string
  bg: string
  image?: string
  cta: string
  link: string
  order: number
}

const EMPTY_FORM = { badge: '', title: '', sub: '', bg: 'linear-gradient(135deg, #002B5C 0%, #2563eb 100%)', image: '', cta: '수강 신청하기', link: '/apply' }
const BG_PRESETS = [
  { color: 'linear-gradient(135deg, #002B5C 0%, #2563eb 100%)', label: '진파랑' },
  { color: 'linear-gradient(135deg, #001233 0%, #003580 100%)', label: '네이비' },
  { color: 'linear-gradient(135deg, #0f4c75 0%, #1b6ca8 100%)', label: '미드블루' },
  { color: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', label: '딥블루' },
  { color: 'linear-gradient(135deg, #1d4ed8 0%, #06b6d4 100%)', label: '스카이' },
  { color: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)', label: '하늘' },
  { color: 'linear-gradient(135deg, #18181b 0%, #374151 100%)', label: '다크' },
]
const LINK_OPTIONS = [
  { value: '/apply', label: '수강 신청 (/apply)', cta: '수강 신청하기' },
  { value: '/courses', label: '수업 소개 (/courses)', cta: '수업 보기' },
  { value: '/blog', label: '블로그 (/blog)', cta: '블로그 보기' },
]

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [sheet, setSheet] = useState<null | 'add' | Banner>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [orderDirty, setOrderDirty] = useState(false)

  async function fetchBanners() {
    try {
      const q = query(collection(db, 'banners'), orderBy('order'))
      const snap = await getDocs(q)
      setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() } as Banner)))
    } catch {
      setBanners([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBanners() }, [])

  function openAdd() {
    setForm(EMPTY_FORM)
    setSheet('add')
  }

  function openEdit(banner: Banner) {
    setForm({ badge: banner.badge, title: banner.title, sub: banner.sub, bg: banner.bg, image: banner.image ?? '', cta: banner.cta, link: banner.link })
    setSheet(banner)
  }

  async function handleSave() {
    if (!form.badge.trim() || !form.title.trim()) return alert('뱃지와 제목을 입력해주세요.')
    setSaving(true)
    try {
      if (sheet === 'add') {
        const nextOrder = banners.length > 0 ? Math.max(...banners.map(b => b.order)) + 1 : 0
        const ref = await addDoc(collection(db, 'banners'), { ...form, order: nextOrder })
        setBanners(prev => [...prev, { id: ref.id, ...form, order: nextOrder }])
      } else if (sheet && typeof sheet === 'object') {
        await updateDoc(doc(db, 'banners', sheet.id), form)
        setBanners(prev => prev.map(b => b.id === (sheet as Banner).id ? { ...b, ...form } : b))
      }
      setSheet(null)
    } catch (e) {
      alert('저장 실패: ' + (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('이 배너를 삭제할까요?')) return
    try {
      await deleteDoc(doc(db, 'banners', id))
      setBanners(prev => prev.filter(b => b.id !== id))
    } catch (e) {
      alert('삭제 실패: ' + (e as Error).message)
    }
  }

  function moveOrder(index: number, dir: -1 | 1) {
    const next = index + dir
    if (next < 0 || next >= banners.length) return
    const arr = [...banners]
    ;[arr[index], arr[next]] = [arr[next], arr[index]]
    setBanners(arr)
    setOrderDirty(true)
  }

  async function saveOrder() {
    setReordering(true)
    try {
      const batch = writeBatch(db)
      banners.forEach((b, i) => {
        batch.update(doc(db, 'banners', b.id), { order: i })
      })
      await batch.commit()
      setBanners(prev => prev.map((b, i) => ({ ...b, order: i })))
      setOrderDirty(false)
    } catch (e) {
      alert('순서 저장 실패: ' + (e as Error).message)
    } finally {
      setReordering(false)
    }
  }

  const isEditing = sheet !== null && sheet !== 'add'

  return (
    <div style={{ padding: '24px 18px 32px' }} className="md:max-w-[1100px] md:mx-auto">

      {/* 헤더 */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ width: 28, height: 3, background: '#2563eb', borderRadius: 999, marginBottom: 10 }} />
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', letterSpacing: '0.06em' }}>BANNER</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#18181b', marginTop: 2 }}>
              홍보배너 관리
            </div>
          </div>
          <button
            onClick={openAdd}
            style={{
              background: '#2563eb', border: 'none', color: '#fff',
              fontSize: 14, fontWeight: 700, padding: '9px 16px',
              borderRadius: 10, cursor: 'pointer', flexShrink: 0,
            }}
          >
            + 배너 추가
          </button>
        </div>
      </div>

      {/* 순서 변경 후 저장 안내 */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 36 }}>
        <span style={{ fontSize: 12, color: '#8c959f' }}>↑↓ 버튼으로 순서 변경 후 저장하세요</span>
        {orderDirty && (
          <button
            onClick={saveOrder}
            disabled={reordering}
            style={{
              background: reordering ? '#f4f4f6' : '#2563eb', border: 'none',
              color: reordering ? '#8c959f' : '#fff',
              fontSize: 12, fontWeight: 700, padding: '8px 14px',
              borderRadius: 8, cursor: reordering ? 'not-allowed' : 'pointer',
            }}
          >
            {reordering ? '저장 중...' : '순서 저장'}
          </button>
        )}
      </div>

      {/* 배너 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#8c959f', fontSize: 14 }}>불러오는 중...</div>
        ) : banners.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#8c959f', fontSize: 14 }}>배너가 없습니다</div>
        ) : banners.map((banner, i) => (
          <div
            key={banner.id}
            style={{ background: '#fff', border: '1px solid #c8d0dc', borderRadius: 14, overflow: 'hidden' }}
          >
            {/* 색상 미리보기 바 */}
            <div style={{ height: 5, background: banner.bg === '#fafafb' ? '#c8d0dc' : banner.bg }} />
            <div style={{ padding: '14px 14px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                {/* 순서 버튼 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={() => moveOrder(i, -1)}
                    disabled={i === 0}
                    style={{ background: '#f4f4f6', border: '1px solid #c8d0dc', borderRadius: 8, color: i === 0 ? '#d4d4d8' : '#52525b', width: 36, height: 36, fontSize: 14, cursor: i === 0 ? 'default' : 'pointer', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >↑</button>
                  <button
                    onClick={() => moveOrder(i, 1)}
                    disabled={i === banners.length - 1}
                    style={{ background: '#f4f4f6', border: '1px solid #c8d0dc', borderRadius: 8, color: i === banners.length - 1 ? '#d4d4d8' : '#52525b', width: 36, height: 36, fontSize: 14, cursor: i === banners.length - 1 ? 'default' : 'pointer', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >↓</button>
                </div>

                {/* 배너 내용 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', background: '#dbeafe', padding: '2px 8px', borderRadius: 5, display: 'inline-block', marginBottom: 5 }}>
                    {banner.badge || '(뱃지 없음)'}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#18181b', lineHeight: 1.3, marginBottom: 3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {banner.title || '(제목 없음)'}
                  </div>
                  <div style={{ fontSize: 12, color: '#71717a', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {banner.cta} → {banner.link}
                  </div>
                </div>

                {/* 수정/삭제 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={() => openEdit(banner)}
                    style={{ background: '#f4f4f6', border: 'none', color: '#52525b', fontSize: 12, fontWeight: 700, padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    style={{ background: '#fff', border: '1px solid #fee2e2', color: '#ef4444', fontSize: 12, fontWeight: 700, padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 추가/수정 Bottom Sheet ── */}
      {sheet !== null && (
        <div
          className="course-sheet-overlay"
          style={{ zIndex: 60 }}
          onClick={() => setSheet(null)}
        >
          <div
            className="course-sheet-panel"
            style={{ maxHeight: '92vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* 핸들 (모바일) */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#c8d0dc' }} />
            </div>

            <div style={{ padding: '8px 20px 28px' }}>
              {/* 시트 헤더 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#18181b' }}>
                  {isEditing ? '배너 수정' : '배너 추가'}
                </div>
                <button
                  onClick={() => setSheet(null)}
                  style={{ background: '#f4f4f6', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 13, color: '#52525b', fontWeight: 600, cursor: 'pointer' }}
                >
                  닫기
                </button>
              </div>

              {/* 미리보기 */}
              <div style={{
                borderRadius: 12, padding: '22px 18px', marginBottom: 20, minHeight: 100, position: 'relative', overflow: 'hidden',
                ...(form.image
                  ? { backgroundImage: `url(${form.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: form.bg || 'linear-gradient(135deg, #002B5C 0%, #2563eb 100%)' }
                ),
              }}>
                <div style={{ position: 'absolute', inset: 0, background: form.image ? 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 100%)' : 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.08) 100%)', borderRadius: 12 }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.72)', letterSpacing: '0.08em', marginBottom: 8 }}>{form.badge || '뱃지'}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', whiteSpace: 'pre-line', lineHeight: 1.25, marginBottom: 6 }}>{form.title || '제목'}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', whiteSpace: 'pre-line', lineHeight: 1.5 }}>{form.sub || '부제'}</div>
                  <div style={{ marginTop: 14, display: 'inline-block', background: '#fff', color: '#18181b', fontSize: 13, fontWeight: 700, padding: '8px 16px', borderRadius: 8 }}>{form.cta || 'CTA'}</div>
                </div>
              </div>

              {/* 폼 필드 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* 뱃지 */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#52525b', marginBottom: 6 }}>뱃지 텍스트</div>
                  <input
                    value={form.badge}
                    onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                    placeholder="예) 2027학년도 디미고 입시"
                    style={{ width: '100%', border: '1px solid #c8d0dc', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    onFocus={e => { e.target.style.borderColor = '#2563eb' }}
                    onBlur={e => { e.target.style.borderColor = '#c8d0dc' }}
                  />
                </div>

                {/* 제목 */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#52525b', marginBottom: 6 }}>제목 <span style={{ color: '#8c959f', fontWeight: 400 }}>(줄바꿈: Enter)</span></div>
                  <textarea
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="예) 합격을 위한&#10;단 하나의 선택"
                    rows={2}
                    style={{ width: '100%', border: '1px solid #c8d0dc', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    onFocus={e => { e.target.style.borderColor = '#2563eb' }}
                    onBlur={e => { e.target.style.borderColor = '#c8d0dc' }}
                  />
                </div>

                {/* 부제 */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#52525b', marginBottom: 6 }}>부제 <span style={{ color: '#8c959f', fontWeight: 400 }}>(줄바꿈: Enter)</span></div>
                  <textarea
                    value={form.sub}
                    onChange={e => setForm(f => ({ ...f, sub: e.target.value }))}
                    placeholder="예) 특별전형부터 일반전형까지,&#10;인코딩플러스와 함께 준비하세요."
                    rows={2}
                    style={{ width: '100%', border: '1px solid #c8d0dc', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    onFocus={e => { e.target.style.borderColor = '#2563eb' }}
                    onBlur={e => { e.target.style.borderColor = '#c8d0dc' }}
                  />
                </div>

                {/* 배경 이미지 URL */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#52525b', marginBottom: 4 }}>배경 이미지 URL</div>
                  <div style={{ fontSize: 11, color: '#8c959f', marginBottom: 8 }}>
                    프로젝트 이미지: <code style={{ background: '#f4f4f6', padding: '1px 5px', borderRadius: 4 }}>/banners/banner1.png</code> 또는 외부 URL
                  </div>
                  <input
                    value={form.image ?? ''}
                    onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    placeholder="/banners/banner1.png 또는 https://..."
                    style={{ width: '100%', border: '1px solid #c8d0dc', borderRadius: 10, padding: '11px 14px', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
                    onFocus={e => { e.target.style.borderColor = '#2563eb' }}
                    onBlur={e => { e.target.style.borderColor = '#c8d0dc' }}
                  />
                  {form.image && (
                    <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', height: 80, background: '#f0f1f4' }}>
                      <img src={form.image} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  {form.image && (
                    <button onClick={() => setForm(f => ({ ...f, image: '' }))}
                      style={{ marginTop: 6, fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      이미지 제거
                    </button>
                  )}
                </div>

                {/* 배경색 — 이미지 없을 때만 활성 */}
                <div style={{ opacity: form.image ? 0.4 : 1, pointerEvents: form.image ? 'none' : 'auto' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#52525b', marginBottom: 4 }}>배경색</div>
                  {form.image && <div style={{ fontSize: 11, color: '#8c959f', marginBottom: 8 }}>이미지 사용 중 — 이미지를 제거하면 배경색이 적용됩니다</div>}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: form.image ? 0 : 8 }}>
                    {BG_PRESETS.map(p => (
                      <button
                        key={p.color}
                        onClick={() => setForm(f => ({ ...f, bg: p.color }))}
                        style={{
                          width: 48, height: 48, borderRadius: 10,
                          background: p.color,
                          border: form.bg === p.color ? '3px solid #2563eb' : '2px solid #c8d0dc',
                          cursor: 'pointer', position: 'relative',
                        }}
                        title={p.label}
                      >
                        {form.bg === p.color && (
                          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#2563eb', fontWeight: 900 }}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CTA 버튼 텍스트 */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#52525b', marginBottom: 6 }}>버튼 텍스트</div>
                  <input
                    value={form.cta}
                    onChange={e => setForm(f => ({ ...f, cta: e.target.value }))}
                    placeholder="예) 수강 신청하기"
                    style={{ width: '100%', border: '1px solid #c8d0dc', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    onFocus={e => { e.target.style.borderColor = '#2563eb' }}
                    onBlur={e => { e.target.style.borderColor = '#c8d0dc' }}
                  />
                </div>

                {/* 링크 */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#52525b', marginBottom: 8 }}>버튼 링크</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {LINK_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, link: opt.value, cta: opt.cta }))}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 14px', borderRadius: 10, textAlign: 'left',
                          border: form.link === opt.value ? '2px solid #2563eb' : '1px solid #c8d0dc',
                          background: form.link === opt.value ? '#dbeafe' : '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                          border: form.link === opt.value ? '5px solid #2563eb' : '2px solid #d4d4d8',
                          background: '#fff',
                        }} />
                        <span style={{ fontSize: 13, fontWeight: form.link === opt.value ? 700 : 500, color: form.link === opt.value ? '#1d4ed8' : '#52525b' }}>
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* 저장 버튼 */}
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  width: '100%', marginTop: 24,
                  background: saving ? '#93c5fd' : '#2563eb',
                  border: 'none', color: '#fff',
                  fontSize: 16, fontWeight: 700,
                  padding: '15px 0', borderRadius: 12,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? '저장 중...' : isEditing ? '수정 완료' : '배너 추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
