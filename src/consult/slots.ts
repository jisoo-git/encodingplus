import type { ConsultConfig } from './types'

/** Firestore 의존 없는 순수 슬롯 계산. 타임존은 브라우저 로컬(KST) 가정. */

const pad2 = (n: number) => String(n).padStart(2, '0')

/** Date → 로컬 YYYY-MM-DD (toISOString는 UTC라 야간 off-by-one 발생 → 사용 금지). */
export function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/** 슬롯 문서 ID = `${date}_${HH}`. */
export function slotKey(date: string, hour: number): string {
  return `${date}_${pad2(hour)}`
}

/** 로컬 자정 기준 요일(0=일 … 6=토). */
export function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00`).getDay()
}

/** 그 날짜에 열리는 정각 슬롯 시각 목록. 휴무면 []. */
export function hoursForDate(config: ConsultConfig, date: string): number[] {
  const sched = config.weekly[weekdayOf(date)]
  if (!sched || !sched.open || sched.start >= sched.end) return []
  const out: number[] = []
  for (let h = sched.start; h < sched.end; h++) out.push(h)
  return out
}

/** 슬롯 시작이 현재보다 미래여야 예약 가능(지난 시간 차단). */
export function isBookable(date: string, hour: number, now: Date): boolean {
  const start = new Date(`${date}T${pad2(hour)}:00:00`)
  return start.getTime() > now.getTime()
}

export interface DateOption {
  date: string // YYYY-MM-DD
  weekday: number
  isToday: boolean
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}
function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

/** 오늘 ~ advanceDays 중 open 요일만. 오늘은 남은 예약가능 슬롯이 있어야 포함. */
export function dateStrip(config: ConsultConfig, now: Date): DateOption[] {
  const base = startOfDay(now)
  const out: DateOption[] = []
  for (let i = 0; i <= config.advanceDays; i++) {
    const d = addDays(base, i)
    const date = ymd(d)
    const hours = hoursForDate(config, date)
    if (!hours.length) continue
    if (i === 0 && !hours.some(h => isBookable(date, h, now))) continue
    out.push({ date, weekday: d.getDay(), isToday: i === 0 })
  }
  return out
}
