// 유입경로(UTM·리퍼러) 캡처 유틸
// 광고 랜딩 URL의 utm_* 파라미터(또는 외부 리퍼러)를 세션 첫 진입 시 sessionStorage에 저장하고,
// 상담 예약·수강신청 제출 시 문서에 함께 저장해 "어느 채널이 이 문의를 만들었는가"를 건 단위로 연결한다.
// first-touch 기준: 이미 저장된 값이 있으면 유지. utm 없고 외부 리퍼러도 없으면(직접 방문) 저장하지 않는다.

const KEY = 'icp_attribution'

export interface Attribution {
  source: string    // utm_source 또는 외부 리퍼러 호스트
  medium: string    // utm_medium 또는 'referral'
  campaign?: string
  content?: string
  term?: string
  referrer?: string // 원본 리퍼러 URL (외부 유입일 때만)
  landing?: string  // 첫 진입 경로 (pathname+search)
}

/** 앱 시작 시 1회 호출(main.tsx). 이미 캡처돼 있으면 유지(first-touch). */
export function captureAttribution(): void {
  try {
    if (sessionStorage.getItem(KEY)) return

    const params = new URLSearchParams(window.location.search)
    const utm = (k: string) => params.get(`utm_${k}`)?.trim() || undefined

    const referrer = document.referrer || undefined
    let referrerHost: string | undefined
    try { referrerHost = referrer ? new URL(referrer).host : undefined } catch { referrerHost = undefined }
    const external = !!referrerHost && referrerHost !== window.location.host

    let a: Attribution | null = null
    const source = utm('source')
    if (source) a = { source, medium: utm('medium') ?? '(none)' }
    else if (external && referrerHost) a = { source: referrerHost, medium: 'referral' }
    if (!a) return

    const campaign = utm('campaign'); if (campaign) a.campaign = campaign
    const content = utm('content'); if (content) a.content = content
    const term = utm('term'); if (term) a.term = term
    if (external && referrer) a.referrer = referrer
    a.landing = window.location.pathname + window.location.search

    sessionStorage.setItem(KEY, JSON.stringify(a))
  } catch { /* sessionStorage 불가 환경(일부 시크릿 모드 등)은 조용히 무시 */ }
}

/** 캡처된 유입경로. null이면 직접 방문이거나 캡처 불가. */
export function getAttribution(): Attribution | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Attribution) : null
  } catch { return null }
}

/** 사람이 읽는 한 줄 표기: "source / medium / campaign". Discord 알림·관리자 목록용. */
export function formatAttribution(a: Attribution): string {
  return [a.source, a.medium, a.campaign].filter(Boolean).join(' / ')
}
