# 데이터 모델 (Firestore)

Firestore 컬렉션별 문서 필드 구조. 용어 정의는 [CONTEXT.md](../CONTEXT.md), 어떤 코드가 읽고 쓰는지는 [PROJECT_MAP.md](PROJECT_MAP.md) "Firebase 컬렉션 → 코드 연결" 참조.

## 컬렉션 구조

| 컬렉션 | 문서 필드 |
|--------|---------|
| `banners` | `{ badge, title, sub, bg, image?, cta, link, order }` |
| `blogPosts` | `{ tag, title, excerpt, coverImage, content: string, date, read, pinned?, published?, views? }` |
| `submissions` | enrollment: `{ name, course, school, phone, formId, status, submittedAt, detail }` / 범용: `{ formId, formTitle, name?, phone?, school?, status, submittedAt, detail }` |
| `forms` | `{ title, description, type, isActive, createdAt, sections: Section[] }` |
| `consultations` | 슬롯 점유. 문서 ID=`YYYY-MM-DD_HH`. `{ kind: 'booking'\|'block', date, hour, name?, phone?, status?, createdAt }` |
| `settings/consultation` | 상담 예약 설정(관리자 편집). `{ enabled, advanceDays, weekly: { 0..6: { open, start, end } } }` |
| `responses` | quiz 전용, **보류** — [CONTEXT.md](../CONTEXT.md) "보류" 섹션 참조 |

## 필드 주의사항

- `banners.image`: 배경 이미지 URL (없으면 `bg` 그라데이션 사용)
- `banners.cta`: **버튼 레이블로 직접 사용**. 비우면 CTA 버튼 자체가 안 나옴
- `blogPosts.content`: **마크다운 string** (`ContentBlock[]` 아님)
- `forms.type`: `'enrollment' | 'quiz'` (`src/types/index.ts`). `quiz`는 보류 상태
- `forms`: REST API로 직접 생성 시 **`createdAt` 필수** — `useForms`가 `orderBy('createdAt')` 사용, 없으면 목록에 안 뜸
- `consultations`: **문서 존재 = 그 시간 점유**. 문서 ID가 슬롯 키(`날짜_시`)라 예약/차단은 트랜잭션으로 원자적 생성, 취소/해제는 문서 삭제. 조회는 `where('date','==',날짜)` 단일 필드 → 복합 인덱스 불필요. 상세는 [specs/CONSULT_SPEC.md](specs/CONSULT_SPEC.md)
