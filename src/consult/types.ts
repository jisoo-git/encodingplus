import type { Timestamp } from 'firebase/firestore'

/** 요일별 예약 가능 시간. start~end는 정각 시작·end 미포함 (start:10,end:16 → 10~15시). */
export interface DaySchedule {
  open: boolean
  start: number // 슬롯 시작 시 (0-23)
  end: number   // 마지막 슬롯 = end-1 시
}

/** settings/consultation 문서. 관리자가 편집. */
export interface ConsultConfig {
  enabled: boolean
  advanceDays: number
  /** 0=일 … 6=토 */
  weekly: Record<number, DaySchedule>
}

export type ConsultStatus = 'new' | 'confirmed' | 'done'

/** consultations/{YYYY-MM-DD_HH} 문서. 존재 = 그 시간 점유. */
export interface ConsultDoc {
  /** 슬롯 키(문서 ID)와 동일 계산: `${date}_${hour}` */
  id: string
  kind: 'booking' | 'block'
  date: string // 로컬 YYYY-MM-DD
  hour: number
  name?: string
  phone?: string
  status?: ConsultStatus
  createdAt?: Timestamp
}

/** 문서가 없을 때 쓰는 초기 스케줄. 수·목·금 10–16, 토·일 10–17, 월·화 휴무. */
export const DEFAULT_CONFIG: ConsultConfig = {
  enabled: true,
  advanceDays: 28,
  weekly: {
    0: { open: true, start: 10, end: 17 },  // 일
    1: { open: false, start: 10, end: 16 }, // 월
    2: { open: false, start: 10, end: 16 }, // 화
    3: { open: true, start: 10, end: 16 },  // 수
    4: { open: true, start: 10, end: 16 },  // 목
    5: { open: true, start: 10, end: 16 },  // 금
    6: { open: true, start: 10, end: 17 },  // 토
  },
}

export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
