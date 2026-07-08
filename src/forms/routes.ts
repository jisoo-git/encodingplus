import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase/config'

interface ApplySettings {
  seminarFormId?: string
}

export async function resolveSeminarApplyPath(): Promise<string | null> {
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
