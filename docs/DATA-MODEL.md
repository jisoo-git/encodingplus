# 데이터 모델 (Firestore)

Firestore 컬렉션별 문서 필드 구조. 용어 정의는 [CONTEXT.md](../CONTEXT.md), 어떤 코드가 읽고 쓰는지는 [PROJECT_MAP.md](PROJECT_MAP.md) "Firebase 컬렉션 → 코드 연결" 참조.

## 컬렉션 구조

| 컬렉션 | 문서 필드 |
|--------|---------|
| `banners` | `{ badge, title, sub, bg, image?, cta, link, order }` |
| `blogPosts` | `{ tag, title, excerpt, coverImage, content: string, date, read, pinned?, published?, views? }` |
| `submissions` | enrollment: `{ name, course, school, phone, formId, status, submittedAt, detail, attribution? }` / 범용: `{ formId, formTitle, name?, phone?, school?, status, submittedAt, detail, attribution? }` |
| `forms` | `{ title, description, type, isActive, createdAt, sections: Section[] }` |
| `consultations` | 슬롯 점유. 문서 ID=`YYYY-MM-DD_HH`. `{ kind: 'booking'\|'block', date, hour, name?, phone?, grade?, status?, attribution?, createdAt }` (`grade`=학생 학년) |
| `settings/consultation` | 상담 예약 설정(관리자 편집). `{ enabled, advanceDays, weekly: { 0..6: { open, start, end } } }` |
| `responses` | quiz 전용, **보류** — [CONTEXT.md](../CONTEXT.md) "보류" 섹션 참조 |

## 필드 주의사항

- `banners.image`: 배경 이미지 URL (없으면 `bg` 그라데이션 사용)
- `banners.cta`: **버튼 레이블로 직접 사용**. 비우면 CTA 버튼 자체가 안 나옴
- `blogPosts.content`: **마크다운 string** (`ContentBlock[]` 아님)
- `forms.type`: `'enrollment' | 'quiz'` (`src/types/index.ts`). `quiz`는 보류 상태
- `forms`: REST API로 직접 생성 시 **`createdAt` 필수** — `useForms`가 `orderBy('createdAt')` 사용, 없으면 목록에 안 뜸
- `consultations`: **문서 존재 = 그 시간 점유**. 문서 ID가 슬롯 키(`날짜_시`)라 예약/차단은 트랜잭션으로 원자적 생성, 취소/해제는 문서 삭제. 조회는 `where('date','==',날짜)` 단일 필드 → 복합 인덱스 불필요. 상세는 [specs/CONSULT_SPEC.md](specs/CONSULT_SPEC.md)
- `attribution` (consultations booking·submissions 공통): 유입경로. `{ source, medium, campaign?, content?, term?, referrer?, landing? }`. 첫 방문 시 `src/lib/attribution.ts`가 URL의 `utm_*`(또는 외부 리퍼러)를 sessionStorage에 캡처(first-touch)해 제출 시 저장. **필드 없음 = 직접 방문 또는 캡처 불가** — 광고 URL에 UTM을 붙여야 채널이 남는다

## Resolved FormType rule: seminar application

- `forms.type` is `enrollment | generic | quiz`.
- Do not add `seminar` as a `forms.type` value.
- Seminar application is routed canonically to a specific Form id with `/apply?formId={formId}`. `/apply?type=seminar` is a compatibility alias resolved through `settings/apply.seminarFormId`, with a fallback to the legacy `forms.type = seminar` Form.
- Seminar submissions are normal records in `submissions`; they are not written to a separate seminar collection.

## Resolved active Form rule

- `isActive` is only a public singleton selector for enrollment Forms.
- There should be no more than one active `enrollment` Form.
- Seminar application Forms are selected by document id (`formId`), not by `isActive`.
- `quiz` remains paused and should not drive public routing.

## Resolved banner link rule

- `banners.link` may exist in stored banner documents and the admin editor.
- The current public home banner click behavior is centralized on `/start`. The seminar image is shown as a home-entry popup, not as a slide banner; its click target is `/apply?type=seminar`. Do not assume arbitrary stored `banners.link` values control `Home.tsx` navigation unless the code is deliberately changed back.

## Paused quiz subsystem

- `responses` is reserved for the paused quiz subsystem.
- Active enrollment and seminar-style applications write to `submissions`, not `responses`.
- `FormPage.tsx`, `Dashboard.tsx`, and `Responses.tsx` should be treated as paused until routes and specs are deliberately restored.
