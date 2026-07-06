import {
  doc, getDoc, setDoc, deleteDoc,
  collection, getDocs, query, where,
  runTransaction, serverTimestamp,
  type QueryDocumentSnapshot, type DocumentData,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { DEFAULT_CONFIG, type ConsultConfig, type ConsultDoc } from './types'
import { slotKey } from './slots'

const COL = 'consultations'
const CONFIG_REF = () => doc(db, 'settings', 'consultation')

function mapDoc(d: QueryDocumentSnapshot<DocumentData>): ConsultDoc {
  return { id: d.id, ...(d.data() as Omit<ConsultDoc, 'id'>) }
}

/** 설정 문서. 없거나 일부만 있으면 DEFAULT_CONFIG로 보정. */
export async function fetchConfig(): Promise<ConsultConfig> {
  try {
    const snap = await getDoc(CONFIG_REF())
    if (!snap.exists()) return DEFAULT_CONFIG
    const data = snap.data() as Partial<ConsultConfig>
    return {
      enabled: data.enabled ?? DEFAULT_CONFIG.enabled,
      advanceDays: data.advanceDays ?? DEFAULT_CONFIG.advanceDays,
      weekly: { ...DEFAULT_CONFIG.weekly, ...(data.weekly ?? {}) },
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

export async function saveConfig(cfg: ConsultConfig): Promise<void> {
  await setDoc(CONFIG_REF(), cfg)
}

/** 특정 날짜의 점유 문서(booking+block). 단일 필드 equality → 복합 인덱스 불필요. */
export async function fetchDayDocs(date: string): Promise<ConsultDoc[]> {
  const snap = await getDocs(query(collection(db, COL), where('date', '==', date)))
  return snap.docs.map(mapDoc)
}

/** 관리자용 전체 조회(소량). client에서 kind/날짜별 분류. */
export async function fetchAll(): Promise<ConsultDoc[]> {
  const snap = await getDocs(collection(db, COL))
  return snap.docs.map(mapDoc)
}

export interface BookInput {
  date: string
  hour: number
  name: string
  phone: string
}

/** 예약 — 트랜잭션으로 원자적 생성. 이미 점유면 SLOT_TAKEN throw. */
export async function bookSlot({ date, hour, name, phone }: BookInput): Promise<string> {
  const id = slotKey(date, hour)
  const ref = doc(db, COL, id)
  await runTransaction(db, async tx => {
    const snap = await tx.get(ref)
    if (snap.exists()) throw new Error('SLOT_TAKEN')
    tx.set(ref, {
      kind: 'booking',
      date,
      hour,
      name: name.trim(),
      phone: phone.trim(),
      status: 'new',
      createdAt: serverTimestamp(),
    })
  })
  return id
}

/** 관리자 차단 — 트랜잭션으로 생성. 이미 점유면 SLOT_TAKEN throw. */
export async function blockSlot(date: string, hour: number): Promise<string> {
  const id = slotKey(date, hour)
  const ref = doc(db, COL, id)
  await runTransaction(db, async tx => {
    const snap = await tx.get(ref)
    if (snap.exists()) throw new Error('SLOT_TAKEN')
    tx.set(ref, { kind: 'block', date, hour, createdAt: serverTimestamp() })
  })
  return id
}

/** 예약 취소 / 차단 해제 — 문서 삭제로 슬롯 재오픈. */
export async function removeSlot(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id))
}

/** 예약 상태 변경. */
export async function updateStatus(id: string, status: ConsultDoc['status']): Promise<void> {
  await setDoc(doc(db, COL, id), { status }, { merge: true })
}
