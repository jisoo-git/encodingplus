// Firestore REST API로 enrollment 폼 삭제 후 새로 생성
const PROJECT = 'form-pwa-academy'
const API_KEY = 'AIzaSyDDhhH_m7c0d4ZBwb18_fjQzBwFqQOb7N4'
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`

function uid() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}

// JS 값 → Firestore 필드 포맷
function toFirestore(val) {
  if (val === null || val === undefined) return { nullValue: null }
  if (typeof val === 'boolean') return { booleanValue: val }
  if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val }
  if (typeof val === 'string') return { stringValue: val }
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestore) } }
  if (typeof val === 'object') {
    const fields = {}
    for (const [k, v] of Object.entries(val)) fields[k] = toFirestore(v)
    return { mapValue: { fields } }
  }
  return { stringValue: String(val) }
}

function objToFields(obj) {
  const fields = {}
  for (const [k, v] of Object.entries(obj)) fields[k] = toFirestore(v)
  return fields
}

// ── 폼 데이터 정의 ──────────────────────────────────────────
const sec1 = uid(), sec2 = uid(), sec3 = uid(), sec4 = uid()

const formData = {
  title: '수강신청 폼',
  description: '',
  type: 'enrollment',
  isActive: true,
  sections: [
    {
      id: sec1,
      title: '신청 확인',
      questions: [
        {
          id: uid(), type: 'info', required: false,
          label: '수강신청 시 입력하신 개인정보(이름, 연락처, 학교 등)는 수업 운영 및 안내 목적으로만 사용되며, 제3자에게 제공되지 않습니다.',
        },
        {
          id: uid(), type: 'radio', required: true,
          label: '개인정보 활용에 동의하십니까?',
          options: ['네', '아니오'],
        },
        {
          id: uid(), type: 'radio', required: true,
          label: '원하시는 수업을 선택해 주세요',
          options: ['입시 단기특강', '일반전형 특강'],
          branching: { '입시 단기특강': sec3, '일반전형 특강': sec4 },
        },
      ],
    },
    {
      id: sec2,
      title: '유의사항',
      questions: [
        {
          id: uid(), type: 'info', required: false,
          label: '수업 개설 기준: 수업은 최소 2명 이상 등록 시 개설됩니다. 인원 미달 시 개별 안내 후 환불 처리됩니다.',
        },
        {
          id: uid(), type: 'info', required: false,
          label: '결석·보충 안내: 수요일 비대면 수업은 보충이 불가합니다. 대면 수업은 1회에 한해 사전 연락 후 보충 가능합니다.',
        },
        {
          id: uid(), type: 'info', required: false,
          label: '수강료 납부: 수강료는 매월 첫 수업 전까지 납부해 주세요. 미납 시 수업 참여가 제한될 수 있습니다.',
        },
        {
          id: uid(), type: 'info', required: false,
          label: '환불 규정: 수강 취소는 개강 1주일 전까지 전액 환불 가능합니다. 이후 취소 시 이미 진행된 수업 횟수에 따라 차등 환불됩니다.',
        },
      ],
    },
    {
      id: sec3,
      title: '입시 단기특강',
      questions: [
        { id: uid(), type: 'short', label: '학생의 이름', required: true },
        { id: uid(), type: 'short', label: '부모님 전화번호', required: true },
        { id: uid(), type: 'short', label: '학교 (예: 양지중)', required: true },
        { id: uid(), type: 'radio', label: '학생의 성별', required: true, options: ['남', '여'] },
        { id: uid(), type: 'short', label: '학생의 생년월일 (6자리, 예: 080703)', required: true },
        { id: uid(), type: 'short', label: '학생 전화번호 (예: 010-1234-5678)', required: true },
        {
          id: uid(), type: 'radio', label: '비대면 수업시간 선택 (매주 수요일)', required: true,
          options: ['수요일 오후 10시 ~ 11시', '수요일 오후 11시 ~ 12시'],
        },
      ],
    },
    {
      id: sec4,
      title: '일반전형 특강',
      questions: [
        { id: uid(), type: 'short', label: '학생의 이름', required: true },
        { id: uid(), type: 'short', label: '부모님 전화번호', required: true },
        { id: uid(), type: 'short', label: '학교 (예: 양지중)', required: true },
        { id: uid(), type: 'radio', label: '학생의 성별', required: true, options: ['남', '여'] },
        { id: uid(), type: 'short', label: '학생의 생년월일 (6자리, 예: 080703)', required: true },
        { id: uid(), type: 'short', label: '학생 전화번호 (예: 010-1234-5678)', required: true },
        {
          id: uid(), type: 'radio', label: '수업요일 선택', required: true,
          options: ['토요일 오후 3시 ~ 오후 6시', '일요일 오후 3시 ~ 오후 6시'],
        },
        {
          id: uid(), type: 'radio', label: '비대면 수업시간 선택 (매주 수요일)', required: true,
          options: ['수요일 오후 10시 ~ 11시', '수요일 오후 11시 ~ 12시'],
        },
      ],
    },
  ],
}

// ── 실행 ────────────────────────────────────────────────────
async function run() {
  // 1. 기존 forms 컬렉션 전체 목록 조회
  console.log('1. 기존 폼 목록 조회 중...')
  const listRes = await fetch(`${BASE}/forms?key=${API_KEY}`)
  const listData = await listRes.json()

  if (listData.documents && listData.documents.length > 0) {
    const toDelete = listData.documents.filter(doc => {
      const type = doc.fields?.type?.stringValue
      return type === 'enrollment'
    })
    console.log(`   enrollment 폼 ${toDelete.length}개 발견 → 삭제 중...`)
    for (const doc of toDelete) {
      const docId = doc.name.split('/').pop()
      const delRes = await fetch(`${BASE}/forms/${docId}?key=${API_KEY}`, { method: 'DELETE' })
      if (delRes.ok || delRes.status === 200) {
        console.log(`   삭제 완료: ${docId}`)
      } else {
        console.warn(`   삭제 실패: ${docId} (${delRes.status})`)
      }
    }
  } else {
    console.log('   기존 폼 없음')
  }

  // 2. 새 폼 생성 (createdAt은 Firestore Timestamp 타입으로 별도 추가)
  console.log('2. 새 폼 생성 중...')
  const fields = objToFields(formData)
  fields.createdAt = { timestampValue: new Date().toISOString() }
  const body = JSON.stringify({ fields })
  const createRes = await fetch(`${BASE}/forms?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
  const createData = await createRes.json()

  if (createRes.ok) {
    const newId = createData.name.split('/').pop()
    console.log(`   생성 완료! ID: ${newId}`)
    console.log('   섹션:', formData.sections.map(s => `"${s.title}"`).join(' / '))
    console.log('   isActive: true')
  } else {
    console.error('   생성 실패:', JSON.stringify(createData, null, 2))
    process.exit(1)
  }
}

run().catch(err => { console.error(err); process.exit(1) })
