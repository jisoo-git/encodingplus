import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase/config'

interface ApplySettings {
  seminarFormId?: string
}

// 설명회 신청 기능 온/오프 스위치.
// false로 두면 설명회 신청의 모든 진입점(홈 팝업·홈 SECTION 5·허브 카드·직접 링크)이 숨겨지고,
// /apply?type=seminar 및 설명회 formId 직접 접근도 "마감 안내"로 대체된다.
// 재활성화하려면 이 값을 true로 되돌리기만 하면 된다 (Firestore 조회 로직은 그대로 유지됨).
export const SEMINAR_APPLY_ENABLED = false

export async function resolveSeminarApplyPath(): Promise<string | null> {
  if (!SEMINAR_APPLY_ENABLED) return null

  const settingsSnap = await getDoc(doc(db, 'settings', 'apply'))
  if (settingsSnap.exists()) {
    const { seminarFormId } = settingsSnap.data() as ApplySettings
    const id = seminarFormId?.trim()
    if (id) return `/apply?formId=${encodeURIComponent(id)}`
  }

  const legacySnap = await getDocs(query(collection(db, 'forms'), where('type', '==', 'seminar')))
  if (legacySnap.empty) return null

  const activeLegacyDoc = legacySnap.docs.find(d => d.data().isActive === true) ?? legacySnap.docs[0]
  return `/apply?formId=${encodeURIComponent(activeLegacyDoc.id)}`
}

// formId가 설명회 신청 폼인지 판별한다 (플래그 상태와 무관하게 항상 정확히 판별).
// Apply.tsx가 formId 직접 접근을 차단할 때 사용 — settings/apply.seminarFormId와 일치하거나
// legacy forms.type === 'seminar'이면 설명회 폼으로 간주한다.
export async function isSeminarFormId(formId: string, formType?: string): Promise<boolean> {
  if (formType === 'seminar') return true

  const settingsSnap = await getDoc(doc(db, 'settings', 'apply'))
  if (settingsSnap.exists()) {
    const { seminarFormId } = settingsSnap.data() as ApplySettings
    if (seminarFormId?.trim() === formId) return true
  }
  return false
}
