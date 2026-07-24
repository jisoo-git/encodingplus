# 인코딩플러스 — 에이전트 문서 목차

이 파일은 에이전트가 먼저 볼 문서의 짧은 TOC다. 상세 규칙은 아래 문서에서 확인하고, 새 문서를 추가하면 이 목차를 함께 갱신한다.

**작업 전 필수 확인 순서:** ① 디자인 → ② 페이지 스펙 → ③ 도메인 용어. 확인 없이 임의로 색상·스타일·구조를 결정하지 말 것.

## 빠른 진입점

| 영역 | 먼저 볼 문서 | 용도 |
|------|-------------|------|
| 도메인 용어 | [CONTEXT.md](CONTEXT.md) | 배너·폼·수강신청·제출 등 용어 |
| 파일/구조 지도 | [docs/PROJECT_MAP.md](docs/PROJECT_MAP.md) | 코드·문서 구조, 컬렉션→코드 |
| 디자인 기준 | [docs/design/DESIGN.md](docs/design/DESIGN.md) | 색·컴포넌트·구현 주의사항 |
| 데이터 모델 | [docs/DATA-MODEL.md](docs/DATA-MODEL.md) | Firestore 컬렉션 필드 구조 |
| 운영·배포 | [docs/OPERATIONS.md](docs/OPERATIONS.md) | 스택·배포·이미지 규칙 |
| 연동 영향범위 | [docs/DEPENDENCY-MAP.md](docs/DEPENDENCY-MAP.md) | 사용자↔관리자 blast radius |
| 결정 기록 | [docs/adr/](docs/adr/) | 왜 이렇게 했는가 (ADR) |
| 작업 현황 | [docs/STATUS.md](docs/STATUS.md) | 진행·완료 기록 |

## 페이지 스펙

| 페이지 | 문서 |
|--------|------|
| 수강신청 Apply | [docs/specs/APPLY_SPEC.md](docs/specs/APPLY_SPEC.md) |
| 상담예약 Consult | [docs/specs/CONSULT_SPEC.md](docs/specs/CONSULT_SPEC.md) |
| 수업소개 Courses | [docs/specs/COURSES_SPEC.md](docs/specs/COURSES_SPEC.md) |
| 블로그 Blog | [docs/specs/BLOG_SPEC.md](docs/specs/BLOG_SPEC.md) |

## 작업별 바로가기

| 작업 | 먼저 읽기 |
|------|----------|
| UI 구현·수정 | [docs/design/DESIGN.md](docs/design/DESIGN.md) |
| 신청 폼 변경 | [docs/specs/APPLY_SPEC.md](docs/specs/APPLY_SPEC.md) → [docs/DEPENDENCY-MAP.md](docs/DEPENDENCY-MAP.md) |
| 상담 예약 변경 | [docs/specs/CONSULT_SPEC.md](docs/specs/CONSULT_SPEC.md) → [docs/DEPENDENCY-MAP.md](docs/DEPENDENCY-MAP.md) |
| 배너·블로그 변경 | [docs/specs/BLOG_SPEC.md](docs/specs/BLOG_SPEC.md) → [docs/DEPENDENCY-MAP.md](docs/DEPENDENCY-MAP.md) |
| 데이터·스키마 변경 | [docs/DATA-MODEL.md](docs/DATA-MODEL.md) → [docs/DEPENDENCY-MAP.md](docs/DEPENDENCY-MAP.md) |
| 배포 | [docs/OPERATIONS.md](docs/OPERATIONS.md) |
