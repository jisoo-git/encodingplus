import { useEffect, useState } from 'react'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query, writeBatch,
} from 'firebase/firestore'
import { db } from '../../firebase/config'

interface Banner {
  id: string
  image: string
  link: string
  order: number
}

const EMPTY_FORM = { image: '', link: '/apply' }

const LINK_OPTIONS = [
  { value: '/apply',   label: '수강 신청 (/apply)' },
  { value: '/courses', label: '수업 소개 (/courses)' },
  { value: '/blog',    label: '블로그 (/blog)' },
  { value: '__custom__', label: '직접 입력 (외부 URL 포함)' },
]

const isCustomLink = (link: string) => !['', '/apply', '/courses', '/blog'].includes(link)

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
      const snap = await getDocs(query(collection(db, 'banners'), orderBy('order')))
      setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() } as Banner)))
    } catch {
      setBanners([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBanners() }, [])

  function openAdd() { setForm(EMPTY_FORM); setSheet('add') }
  function openEdit(b: Banner) { setForm({ image: b.image, link: b.link }); setSheet(b) }

  async function handleSave() {
    if (!form.image.trim()) return alert('이미지 URL을 입력해주세요.')
    if (!form.link.trim()) return alert('링크를 입력해주세요.')
    setSaving(true)
    try {
      const data = { image: form.image, link: form.link, badge: '', title: '', sub: '', bg: '', cta: '' }
      if (sheet === 'add') {
        const nextOrder = banners.length > 0 ? Math.max(...banners.map(b => b.order)) + 1 : 0
        const ref = await addDoc(collection(db, 'banners'), { ...data, order: nextOrder })
        setBanners(prev => [...prev, { id: ref.id, image: form.image, link: form.link, order: nextOrder }])
      } else if (sheet && typeof sheet === 'object') {
        await updateDoc(doc(db, 'banners', sheet.id), data)
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
      banners.forEach((b, i) => batch.update(doc(db, 'banners', b.id), { order: i }))
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
            <div style={{ fontSize: 22, fontWeight: 800, color: '#18181b', marginTop: 2 }}>홍보배너 관리</div>
          </div>
          <button
            onClick={openAdd}
            style={{ background: '#2563eb', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, padding: '9px 16px', borderRadius: 10, cursor: 'pointer', flexShrink: 0 }}
          >
            + 배너 추가
          </button>
        </div>
      </div>

      {/* 순서 저장 */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 36 }}>
        <span style={{ fontSize: 12, color: '#8c959f' }}>↑↓ 버튼으로 순서 변경 후 저장하세요</span>
        {orderDirty && (
          <button
            onClick={saveOrder}
            disabled={reordering}
            style={{ background: reordering ? '#f4f4f6' : '#2563eb', border: 'none', color: reordering ? '#8c959f' : '#fff', fontSize: 12, fontWeight: 700, padding: '8px 14px', borderRadius: 8, cursor: reordering ? 'not-allowed' : 'pointer' }}
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
          <div key={banner.id} style={{ background: '#fff', border: '1px solid #c8d0dc', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 12, padding: 12, alignItems: 'center' }}>

              {/* 순서 버튼 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                <button onClick={() => moveOrder(i, -1)} disabled={i === 0}
                  style={{ background: '#f4f4f6', border: '1px solid #c8d0dc', borderRadius: 8, color: i === 0 ? '#d4d4d8' : '#52525b', width: 36, height: 36, fontSize: 14, cursor: i === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</button>
                <button onClick={() => moveOrder(i, 1)} disabled={i === banners.length - 1}
                  style={{ background: '#f4f4f6', border: '1px solid #c8d0dc', borderRadius: 8, color: i === banners.length - 1 ? '#d4d4d8' : '#52525b', width: 36, height: 36, fontSize: 14, cursor: i === banners.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↓</button>
              </div>

              {/* 이미지 썸네일 */}
              <div style={{ width: 100, height: 56, borderRadius: 8, overflow: 'hidden', background: '#f0f1f4', flexShrink: 0 }}>
                {banner.image
                  ? <img src={banner.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#a1a1aa' }}>이미지 없음</div>
                }
              </div>

              {/* 링크 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: '#71717a', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  클릭 → {banner.link || '(링크 없음)'}
                </div>
              </div>

              {/* 수정/삭제 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                <button onClick={() => openEdit(banner)}
                  style={{ background: '#f4f4f6', border: 'none', color: '#52525b', fontSize: 12, fontWeight: 700, padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}>
                  수정
                </button>
                <button onClick={() => handleDelete(banner.id)}
                  style={{ background: '#fff', border: '1px solid #fee2e2', color: '#ef4444', fontSize: 12, fontWeight: 700, padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}>
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Sheet */}
      {sheet !== null && (
        <div className="course-sheet-overlay" style={{ zIndex: 60 }} onClick={() => setSheet(null)}>
          <div className="course-sheet-panel" style={{ maxHeight: '92vh' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#c8d0dc' }} />
            </div>

            <div style={{ padding: '8px 20px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#18181b' }}>
                  {isEditing ? '배너 수정' : '배너 추가'}
                </div>
                <button onClick={() => setSheet(null)}
                  style={{ background: '#f4f4f6', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 13, color: '#52525b', fontWeight: 600, cursor: 'pointer' }}>
                  닫기
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* 이미지 URL */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#52525b', marginBottom: 4 }}>이미지 URL <span style={{ color: '#ef4444' }}>*</span></div>
                  <div style={{ fontSize: 11, color: '#8c959f', marginBottom: 8 }}>
                    <code style={{ background: '#f4f4f6', padding: '1px 5px', borderRadius: 4 }}>/banners/파일명.png</code> 또는 외부 URL
                  </div>
                  <input
                    value={form.image}
                    onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    placeholder="/banners/banner1.png"
                    style={{ width: '100%', border: '1px solid #c8d0dc', borderRadius: 10, padding: '11px 14px', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
                    onFocus={e => { e.target.style.borderColor = '#2563eb' }}
                    onBlur={e => { e.target.style.borderColor = '#c8d0dc' }}
                  />
                  {/* 이미지 미리보기 */}
                  {form.image && (
                    <div style={{ marginTop: 10, borderRadius: 10, overflow: 'hidden', aspectRatio: '16/9', background: '#f0f1f4' }}>
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

                {/* 클릭 링크 */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#52525b', marginBottom: 8 }}>클릭 링크 <span style={{ color: '#ef4444' }}>*</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {LINK_OPTIONS.map(opt => {
                      const isCustom = opt.value === '__custom__'
                      const selected = isCustom ? isCustomLink(form.link) : form.link === opt.value
                      return (
                        <div key={opt.value}>
                          <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, link: isCustom ? '' : opt.value }))}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                              padding: '12px 14px', borderRadius: 10, textAlign: 'left',
                              border: selected ? '2px solid #2563eb' : '1px solid #c8d0dc',
                              background: selected ? '#dbeafe' : '#fff',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: selected ? '5px solid #2563eb' : '2px solid #d4d4d8', background: '#fff' }} />
                            <span style={{ fontSize: 13, fontWeight: selected ? 700 : 500, color: selected ? '#1d4ed8' : '#52525b' }}>
                              {opt.label}
                            </span>
                          </button>
                          {isCustom && selected && (
                            <input
                              value={form.link}
                              onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                              placeholder="https://... 또는 /경로"
                              style={{ marginTop: 6, width: '100%', border: '1px solid #c8d0dc', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                              onFocus={e => { e.target.style.borderColor = '#2563eb' }}
                              onBlur={e => { e.target.style.borderColor = '#c8d0dc' }}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                style={{ width: '100%', marginTop: 24, background: saving ? '#93c5fd' : '#2563eb', border: 'none', color: '#fff', fontSize: 16, fontWeight: 700, padding: '15px 0', borderRadius: 12, cursor: saving ? 'not-allowed' : 'pointer' }}
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
