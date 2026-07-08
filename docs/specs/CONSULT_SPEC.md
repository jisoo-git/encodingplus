# 상담 예약(Consult) 스펙

`/consult`(사용자)·`/admin/consultations`(관리자)에서 상담 예약을 처리하는 방식. 용어는 [CONTEXT.md](../../CONTEXT.md), 데이터 구조는 [DATA-MODEL.md](../DATA-MODEL.md), 연동 영향은 [DEPENDENCY-MAP.md](../DEPENDENCY-MAP.md) 참조.

> 상담 예약은 **수강신청·설명회 신청과 별개 흐름·별개 저장소**다. `submissions`가 아니라 `consultations` 컬렉션을 쓴다. 폼(Form) 시스템을 재사용하지 않는다.

## 핵심 원칙 — 슬롯 = 문서

- 상담은 **1시간 단위 슬롯**, **슬롯당 1팀**만 받는다.
- 슬롯 문서 ID = `YYYY-MM-DD_HH` (예: `2026-07-08_14`). **문서가 존재한다 = 그 시간은 점유됐다.**
- 점유는 두 종류: `kind:'booking'`(사용자 예약) / `kind:'block'`(관리자 차단). 화면에선 둘 다 disabled.
- **취소·차단해제 = 문서 삭제** → 그 시간 다시 열림.

## 중복 예약 방지 (동시성)

- 서버가 없고 클라이언트가 Firestore에 직접 쓰므로, 화면 disabled만으로는 동시 클릭을 못 막는다.
- 예약은 반드시 **`runTransaction`** 으로 처리한다: 슬롯 문서를 읽어 **있으면 `SLOT_TAKEN` 에러 / 없으면 그 자리에서 생성**. Firestore가 충돌을 직렬화해 한 명만 성공한다.
- 화면 disabled는 로드 시점 스냅샷(UX)일 뿐이고, **실제 보증은 트랜잭션**이다. 예약 순간 이미 찼으면 "방금 마감됨" 안내 후 슬롯 목록을 갱신한다.
- 현재 Firestore 규칙은 개방(`allow read,write: if true`). 규칙 하드닝(`allow create: if !exists()`)은 후속 옵션으로만 남긴다(이번 범위 아님).

## 가용 시간 — 설정 문서 기반

- 스케줄을 코드에 박지 않는다. **`settings/consultation`** 문서를 관리자가 편집한다.
- 요일별(`0=일 … 6=토`) `{ open, start, end }`. `start`~`end`는 **정각 시작, end 미포함**(예: `start:10,end:16` → 10·11·12·13·14·15시 슬롯 6개).
- 문서가 없으면 **DEFAULT_CONFIG**(초기 시드)를 쓴다:

| 요일 | open | start–end | 슬롯 |
|------|------|-----------|------|
| 일 | ✓ | 10–17 | 10~16시 (7) |
| 월·화 | ✗ | — | 휴무 |
| 수·목·금 | ✓ | 10–16 | 10~15시 (6) |
| 토 | ✓ | 10–17 | 10~16시 (7) |

- `advanceDays`(기본 28): 오늘부터 며칠 앞까지 예약 허용.
- `enabled`: false면 사용자 페이지에 "상담 예약 준비 중" 표시.

## 사용자 화면 `/consult`

1. **월 캘린더**(`react-day-picker` v10, 인라인): 휴무 요일(`weekly[wd].open=false`)·과거일·`advanceDays` 밖은 `disabled` 매처로 비활성화. 요일 헤더·캡션은 `formatters`로 한글화, 톤은 `.consult-cal` 스코프 CSS로 파랑(#2563eb) 매칭. 최초 진입 시 `dateStrip`의 첫 예약가능일을 자동 선택.
2. 날짜 선택(`onSelect` → `ymd`로 문자열화) → 요일로 설정 조회 → 해당 날짜 슬롯 생성.
3. `consultations` 그 날짜 문서 조회(`where('date','==',날짜)`) → 점유 시간 집합.
4. **슬롯 칩 격자**: 점유(booking/block)·**지난 시간**(오늘 한정, 슬롯 시작이 현재 이전)은 disabled.
5. 빈 칩 선택 → **이름·학년·연락처** 입력(학년=`초6 미만·초6~고3·기타` 드롭다운, 셋 다 필수) → `예약하기`(트랜잭션).
6. 성공 시 완료 모달(기존 `Apply.tsx` 패턴 재사용). `SLOT_TAKEN`이면 안내 + 슬롯 갱신.

- 스타일은 `Apply.tsx`의 칩/버튼 톤(파랑 `#2563eb`, 테두리 `#c8d0dc`)을 따른다.
- 타임존은 **KST(브라우저 로컬)** 가정. 날짜 문자열은 로컬 `YYYY-MM-DD`(`toISOString` UTC 금지 — 야간 off-by-one 방지).

## 관리자 `/admin/consultations`

내부 3개 섹션(서브탭):

| 섹션 | 동작 | 데이터 |
|------|------|--------|
| 예약 목록 | 날짜별 그룹, 이름·연락처·상태(new/confirmed/done) 변경, **예약 취소**(문서 삭제) | `consultations` `kind:'booking'` |
| 시간 차단 | 날짜/시간 선택 후 **차단**(`kind:'block'` 생성)·**해제**(삭제) | `consultations` `kind:'block'` |
| 스케줄 설정 | 요일별 open·start·end·advanceDays·enabled 편집 → 저장 | `settings/consultation` |

- 관리자 조회는 `consultations` 전체를 한 번에 읽어 client에서 kind/날짜별로 나눈다(복합 인덱스 회피, 학원 규모상 소량).
- 관리자 탭이 4개→**5개**가 된다(`AdminLayout`의 `ADMIN_TABS`·`BOTTOM_TABS` 둘 다 추가).

### 신청현황 통합 인박스

상담 예약을 놓치지 않도록 `AdminSubmissions`(신청현황)가 `submissions` **+ `consultations`(예약분)를 한 목록**으로 합쳐 보여준다. 두 흐름의 상태 모델이 동일(`new/confirmed/done`)해 UI를 그대로 재사용한다.

- 각 행에 **출처(`source`) 구분**: `submission`(수강신청·설명회) / `consult`(상담예약). 유형 배지로 표시, 상담예약은 `날짜(요일) 시` 를 보조 텍스트로.
- 필터 pill에 **"상담예약"** 추가(`__consult__` 센티널). "전체"는 도착순으로 모두 표시 → 누락 방지.
- **상태 변경은 출처별 라우팅**: `consult`면 `consultations` 문서, 아니면 `submissions` 문서에 기록.
- **역할 분담**: 신청현황 = 통합 인박스(놓침 방지), 상담예약 탭 = 슬롯 운영(취소·차단·스케줄). 슬롯 취소/차단은 상담예약 탭에서만.

## 진입점 · 라우팅

- 라우트: `/consult`(사용자, `UserLayout` 하위), `/admin/consultations`(관리자, `ProtectedRoute` 하위).
- **상담·신청 허브(`/start`, `ApplyHub.tsx`)가 단일 진입점**이다. 흩어져 있던 상담예약·수강신청·설명회 3흐름을 카드 3장으로 묶고, "상담 예약" 카드가 `/consult`로 연결한다. `/consult` 자체는 그대로(슬롯 예약 시스템 무변경).
- 모든 네비 표면이 허브로 모인다: `TopNav` CTA "상담·신청 →" → `/start`, `BottomNav` "신청" 탭 → `/start`(기존 바텀시트 제거), `Drawer` "상담·신청" → `/start`. 홈 다크 CTA도 `/start`.
- Vercel `vercel.json` catch-all rewrite로 딥링크 정상(설정 변경 불필요).

## 코드 구조

| 파일 | 역할 |
|------|------|
| `src/consult/types.ts` | `ConsultConfig`·`DaySchedule`·`ConsultDoc`(booking/block)·`ConsultStatus` |
| `src/consult/slots.ts` | 순수 함수 — `ymd`·`slotKey`·`hoursForDate`·`dateStrip`·`isBookable`. Firestore 의존 없음 |
| `src/consult/api.ts` | Firestore I/O — `fetchConfig`·`saveConfig`·`fetchDayDocs`·`fetchAll`·`bookSlot`(트랜잭션)·`cancelSlot`·`blockSlot`·`unblockSlot` |
| `src/pages/Consult.tsx` | 사용자 예약 페이지 |
| `src/pages/admin/AdminConsultations.tsx` | 관리자 3섹션 페이지 |

## 엣지 케이스

- 오늘 지난 시간 → disabled. 휴무 요일·`advanceDays` 밖 → 스트립 제외.
- 관리자가 스케줄을 줄여도 기존 예약 문서는 유지(새 예약만 차단).
- `settings/consultation` 없으면 사용자 페이지는 DEFAULT_CONFIG로 동작(공개 페이지는 설정을 쓰지 않음, 예약 트랜잭션만 씀).
