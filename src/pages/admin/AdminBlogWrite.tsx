import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import type { Post, ContentBlock } from '../../types'
import { FALLBACK_POSTS } from '../Blog'

const COMMON_TAGS = ['특별전형', '일반전형', '소질적성', '면접', '실적물', '자소서', '합격후기', '특성화고']
const newId = () => crypto.randomUUID()

function Field({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #c8d0dc', borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#52525b', marginBottom: sub ? 3 : 10 }}>
        {label}
        {sub && <span style={{ fontWeight: 400, color: '#8c959f', marginLeft: 6 }}>{sub}</span>}
      </div>
      {children}
    </div>
  )
}

export default function AdminBlogWrite() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [tag, setTag] = useState('')
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [blocks, setBlocks] = useState<(ContentBlock & { _id: string })[]>([
    { _id: newId(), type: 'text', text: '' },
  ])
  const [saving, setSaving] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [currentPublished, setCurrentPublished] = useState<boolean | undefined>(undefined)

  // 편집 모드: 기존 글 로드
  useEffect(() => {
    if (!isEdit) return
    async function loadPost() {
      try {
        const snap = await getDoc(doc(db, 'blogPosts', id as string))
        const post: Post = snap.exists()
          ? { id: snap.id, ...(snap.data() as Omit<Post, 'id'>) }
          : FALLBACK_POSTS.find(p => p.id === id) || FALLBACK_POSTS[0]
        setTag(post.tag)
        setTitle(post.title)
        setExcerpt(post.excerpt)
        setCoverImage(post.coverImage)
        setBlocks(post.content.map(b => ({ ...b, _id: newId() })))
        setCurrentPublished(post.published)
      } finally {
        setLoading(false)
      }
    }
    loadPost()
  }, [id, isEdit])

  function addTextBlock() {
    setBlocks(prev => [...prev, { _id: newId(), type: 'text' as const, text: '' }])
  }
  function addImageBlock() {
    setBlocks(prev => [...prev, { _id: newId(), type: 'image' as const, url: '', caption: '' }])
  }
  function removeBlock(blockId: string) {
    setBlocks(prev => prev.filter(b => b._id !== blockId))
  }
  function updateBlock(blockId: string, updates: Partial<ContentBlock>) {
    setBlocks(prev => prev.map(b => b._id === blockId ? { ...b, ...updates } : b))
  }
  function moveBlock(index: number, dir: -1 | 1) {
    const next = index + dir
    if (next < 0 || next >= blocks.length) return
    const arr = [...blocks]
    ;[arr[index], arr[next]] = [arr[next], arr[index]]
    setBlocks(arr)
  }

  function estimateRead() {
    const totalChars = blocks.filter(b => b.type === 'text').reduce((acc, b) => acc + (b.text?.length ?? 0), 0)
    const mins = Math.max(1, Math.round(totalChars / 500))
    return `${mins}분`
  }

  function buildPayload(published: boolean) {
    const cleanBlocks: ContentBlock[] = blocks
      .filter(b => b.type === 'text' ? !!b.text?.trim() : !!b.url?.trim())
      .map(({ _id: _, ...b }) => b)
    const today = new Date().toISOString().slice(0, 10)
    return {
      tag: tag.trim(), title: title.trim(), excerpt: excerpt.trim(),
      coverImage: coverImage.trim(), content: cleanBlocks,
      ...(isEdit ? {} : { date: today }),
      read: estimateRead(),
      published,
      updatedAt: serverTimestamp(),
    }
  }

  async function handleSaveDraft() {
    if (!tag.trim()) return alert('태그를 입력해주세요.')
    if (!title.trim()) return alert('제목을 입력해주세요.')
    setSavingDraft(true)
    try {
      const payload = buildPayload(false)
      if (isEdit) {
        await updateDoc(doc(db, 'blogPosts', id as string), payload)
      } else {
        await addDoc(collection(db, 'blogPosts'), { ...payload, createdAt: serverTimestamp() })
      }
      navigate('/admin/blog')
    } catch (e) {
      alert('저장 실패: ' + (e as Error).message)
    } finally {
      setSavingDraft(false)
    }
  }

  async function handlePublish() {
    if (!tag.trim()) return alert('태그를 입력해주세요.')
    if (!title.trim()) return alert('제목을 입력해주세요.')
    if (!excerpt.trim()) return alert('요약을 입력해주세요.')
    const cleanBlocks = blocks.filter(b => b.type === 'text' ? !!b.text?.trim() : !!b.url?.trim())
    if (cleanBlocks.length === 0) return alert('본문을 입력해주세요.')
    setSaving(true)
    try {
      const payload = buildPayload(true)
      if (isEdit) {
        await updateDoc(doc(db, 'blogPosts', id as string), payload)
      } else {
        await addDoc(collection(db, 'blogPosts'), { ...payload, createdAt: serverTimestamp() })
      }
      navigate('/admin/blog')
    } catch (e) {
      alert('저장 실패: ' + (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  // 편집 모드에서 published 상태 유지 저장 (현재 상태 그대로)
  async function handleSaveEdit() {
    if (!tag.trim()) return alert('태그를 입력해주세요.')
    if (!title.trim()) return alert('제목을 입력해주세요.')
    setSaving(true)
    try {
      const payload = buildPayload(currentPublished ?? true)
      await updateDoc(doc(db, 'blogPosts', id as string), payload)
      navigate('/admin/blog')
    } catch (e) {
      alert('저장 실패: ' + (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const isDraft = isEdit && currentPublished === false

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240, color: '#8c959f', fontSize: 14 }}>불러오는 중...</div>
  )

  return (
    <div style={{ padding: '0 0 60px' }} className="md:max-w-[1100px] md:mx-auto">

      {/* 헤더 */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #c8d0dc',
        padding: '14px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div>
          <button
            onClick={() => navigate('/admin/blog')}
            style={{ background: 'none', border: 'none', color: '#8c959f', fontSize: 12, fontWeight: 600, padding: '0 0 4px', cursor: 'pointer' }}
          >
            ← 블로그 목록
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#18181b' }}>{isEdit ? '글 수정' : '새 글 작성'}</span>
            {isEdit && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                background: isDraft ? '#f4f4f6' : '#dcfce7',
                color: isDraft ? '#71717a' : '#15803d',
              }}>
                {isDraft ? '초안' : '발행됨'}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
          <button
            onClick={() => navigate('/admin/blog')}
            style={{ background: '#f4f4f6', border: 'none', color: '#52525b', fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 10, cursor: 'pointer' }}
          >
            취소
          </button>
          {/* 새 글: 초안저장 + 발행하기 / 편집(초안): 초안저장 + 발행하기 / 편집(발행됨): 저장 */}
          {(!isEdit || isDraft) && (
            <button
              onClick={handleSaveDraft}
              disabled={savingDraft}
              style={{ background: '#f4f4f6', border: 'none', color: '#52525b', fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 10, cursor: savingDraft ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
            >
              {savingDraft ? '저장 중...' : '초안 저장'}
            </button>
          )}
          {isEdit && !isDraft ? (
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              style={{ background: saving ? '#93c5fd' : '#2563eb', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, padding: '9px 18px', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={saving}
              style={{ background: saving ? '#93c5fd' : '#2563eb', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, padding: '9px 18px', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
            >
              {saving ? '저장 중...' : '발행하기'}
            </button>
          )}
        </div>
      </div>

      {/* 폼 필드들 */}
      <div style={{ padding: '16px 18px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* 해시태그 */}
        <Field label="해시태그" sub="(1개)">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {COMMON_TAGS.map(t => (
              <button
                key={t}
                onClick={() => setTag(t)}
                style={{
                  padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  border: tag === t ? '2px solid #2563eb' : '1px solid #c8d0dc',
                  background: tag === t ? '#dbeafe' : '#f4f4f6',
                  color: tag === t ? '#1d4ed8' : '#52525b',
                  cursor: 'pointer',
                }}
              >
                #{t}
              </button>
            ))}
          </div>
          <input
            value={tag}
            onChange={e => setTag(e.target.value)}
            placeholder="직접 입력..."
            style={{ width: '100%', border: '1px solid #c8d0dc', borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => { e.target.style.borderColor = '#2563eb' }}
            onBlur={e => { e.target.style.borderColor = '#c8d0dc' }}
          />
        </Field>

        {/* 제목 */}
        <Field label="제목">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="글 제목을 입력하세요"
            style={{ width: '100%', border: '1px solid #c8d0dc', borderRadius: 8, padding: '10px 12px', fontSize: 16, fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => { e.target.style.borderColor = '#2563eb' }}
            onBlur={e => { e.target.style.borderColor = '#c8d0dc' }}
          />
        </Field>

        {/* 요약 */}
        <Field label="요약" sub="(목록 카드에 보이는 설명)">
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            placeholder="글의 핵심 내용을 2~3문장으로 요약하세요"
            rows={2}
            style={{ width: '100%', border: '1px solid #c8d0dc', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
            onFocus={e => { e.target.style.borderColor = '#2563eb' }}
            onBlur={e => { e.target.style.borderColor = '#c8d0dc' }}
          />
        </Field>

        {/* 대표 이미지 */}
        <Field label="대표 이미지 URL">
          <input
            value={coverImage}
            onChange={e => setCoverImage(e.target.value)}
            placeholder="https://..."
            style={{ width: '100%', border: '1px solid #c8d0dc', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => { e.target.style.borderColor = '#2563eb' }}
            onBlur={e => { e.target.style.borderColor = '#c8d0dc' }}
          />
          {coverImage && (
            <div style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden', height: 120, background: '#f0f1f4' }}>
              <img src={coverImage} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </Field>

        {/* 본문 블록 에디터 */}
        <div style={{ background: '#fff', border: '1px solid #c8d0dc', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#52525b', marginBottom: 12 }}>본문</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {blocks.map((block, i) => (
              <div key={block._id} style={{ border: '1px solid #c8d0dc', borderRadius: 10, overflow: 'hidden' }}>
                {/* 블록 툴바 */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', background: '#f9fafb', borderBottom: '1px solid #c8d0dc',
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#71717a' }}>
                    {block.type === 'text' ? '📝 텍스트' : '🖼️ 이미지'}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => moveBlock(i, -1)} disabled={i === 0} style={{ background: 'none', border: 'none', color: i === 0 ? '#c8d0dc' : '#8c959f', fontSize: 13, padding: '4px 6px', cursor: i === 0 ? 'default' : 'pointer', minWidth: 28 }}>↑</button>
                    <button onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1} style={{ background: 'none', border: 'none', color: i === blocks.length - 1 ? '#c8d0dc' : '#8c959f', fontSize: 13, padding: '4px 6px', cursor: i === blocks.length - 1 ? 'default' : 'pointer', minWidth: 28 }}>↓</button>
                    <button onClick={() => removeBlock(block._id)}
                      style={{ background: 'none', border: 'none', color: '#d4d4d8', fontSize: 16, padding: '4px 6px', cursor: 'pointer', minWidth: 28 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#d4d4d8' }}
                    >×</button>
                  </div>
                </div>
                {/* 블록 내용 */}
                {block.type === 'text' ? (
                  <textarea
                    value={block.text ?? ''}
                    onChange={e => updateBlock(block._id, { text: e.target.value })}
                    placeholder="내용을 입력하세요..."
                    rows={4}
                    style={{ width: '100%', border: 'none', padding: '12px 14px', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7, color: '#3f3f46', background: '#fff' }}
                  />
                ) : (
                  <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, background: '#fff' }}>
                    <input
                      value={block.url ?? ''}
                      onChange={e => updateBlock(block._id, { url: e.target.value })}
                      placeholder="이미지 URL (https://...)"
                      style={{ width: '100%', border: '1px solid #c8d0dc', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => { e.target.style.borderColor = '#2563eb' }}
                      onBlur={e => { e.target.style.borderColor = '#c8d0dc' }}
                    />
                    {block.url && (
                      <img src={block.url} alt="" style={{ width: '100%', borderRadius: 8, maxHeight: 180, objectFit: 'cover', background: '#f0f1f4' }} />
                    )}
                    <input
                      value={block.caption ?? ''}
                      onChange={e => updateBlock(block._id, { caption: e.target.value })}
                      placeholder="이미지 설명 (선택)"
                      style={{ width: '100%', border: '1px solid #c8d0dc', borderRadius: 8, padding: '8px 12px', fontSize: 12, outline: 'none', boxSizing: 'border-box', color: '#71717a' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 블록 추가 */}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              onClick={addTextBlock}
              style={{ flex: 1, background: '#f9fafb', border: '1px dashed #bfdbfe', color: '#2563eb', borderRadius: 8, padding: '11px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
            >
              + 텍스트 블록
            </button>
            <button
              onClick={addImageBlock}
              style={{ flex: 1, background: '#f9fafb', border: '1px dashed #bfdbfe', color: '#2563eb', borderRadius: 8, padding: '11px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
            >
              + 이미지 블록
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
