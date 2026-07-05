# 인코딩플러스 프로젝트 전체 파일 지도

> 각 파일이 무엇인지 한눈에 파악하기 위한 총정리.
> 새 세션에서 모르는 게 있으면 이 파일부터 확인할 것.

---

## 루트

| 파일 | 역할 |
|------|------|
| `CLAUDE.md` | **문서 목차(TOC)** — 먼저 볼 문서로 가는 얇은 인덱스. Claude Code 세션마다 자동 로드. 상세 규칙은 각 docs 문서에. |
| `CONTEXT.md` | **용어 사전(글로서리)** — 배너·폼·수강신청·제출 등 도메인 용어 정의. |
| `index.html` | Vite 진입점 (PWA manifest, 아이콘 링크) |
| `vite.config.ts` | Vite 설정 (PWA 플러그인 포함) |
| `package.json` | 의존성 목록 |

---

## src/

### 진입점
| 파일 | 역할 |
|------|------|
| `main.tsx` | React 앱 마운트, StrictMode |
| `App.tsx` | 라우터 정의 (모든 페이지 경로 여기서 관리) |
| `index.css` | 전역 CSS — body 스타일, hover-card, hover-btn, nav-btn, dark-cta-bottom, apply-btn-area, step-indicator, course-sheet-overlay/panel, blog-list-bottom |
| `App.css` | 미사용 (삭제 가능) |

### src/types/
| 파일 | 역할 |
|------|------|
| `index.ts` | 모든 TypeScript 타입 정의 — `QuestionType`, `Form`, `Section`, `Question`, `Response`, `Post` |

### 루트 (src/)
| 파일 | 역할 |
|------|------|
| `vite-env.d.ts` | Vite 클라이언트 타입 선언 (`/// <reference types="vite/client" />`) |

### src/firebase/
| 파일 | 역할 |
|------|------|
| `config.ts` | Firebase 초기화 + `db` export (Firestore) |

### src/hooks/
| 파일 | 역할 |
|------|------|
| `useAuth.ts` | Firebase Auth 훅 — `user`, `login`, `logout` |
| `useForms.ts` | Firestore CRUD 훅 — `getForm`, `createForm`, `updateForm`, `deleteForm`, `getForms` |
| `useUpload.ts` | Firebase Storage 업로드 (현재 미사용) |

### src/layouts/
| 파일 | 역할 |
|------|------|
| `UserLayout.tsx` | 사용자 페이지 공통 레이아웃 — TopNav + BottomNav + Drawer 포함, `<Outlet />` |
| `AdminLayout.tsx` | 관리자 레이아웃 — 상단바 + 데스크탑 서브탭 + 모바일 BottomNav 4탭 (신청현황/폼편집/홍보배너/블로그), 최대 440px |

### src/components/nav/
| 파일 | 역할 |
|------|------|
| `TopNav.tsx` | 상단 네비게이션 — 로고, 데스크탑 메뉴, 모바일 햄버거(Drawer 열기) |
| `BottomNav.tsx` | 모바일 하단 탭 — 홈/수업소개/수강신청/블로그 4탭, fixed bottom |
| `Drawer.tsx` | 모바일 사이드 드로어 — TopNav 햄버거 클릭 시 열림 |

### src/components/builder/
| 파일 | 역할 |
|------|------|
| `SortableQuestion.tsx` | 드래그 가능한 질문 카드 컴포넌트 (dnd-kit 사용) |
| `QuestionEditor.tsx` | 질문 타입별 편집 UI (단답/장문/객관식/체크박스/OX/드롭다운/날짜/숫자/PDF) |

### src/components/ui/
| 파일 | 역할 |
|------|------|
| `ProtectedRoute.tsx` | 관리자 인증 체크 — 미로그인 시 /admin으로 리다이렉트 |
| `AdminLayout.tsx` | **미사용** (layouts/AdminLayout.tsx 사용 중) |

### src/pages/ (사용자)
| 파일 | 역할 |
|------|------|
| `Home.tsx` | 홈 — 배너 슬라이더(Firestore/FALLBACK), Stats, WHY 섹션, 개설강좌 2개 미리보기, 다크 CTA |
| `Courses.tsx` | 수업소개 — CourseFullCard 전면 표시(상세설명·수업구성·수업시간·CTA / 수강료 미노출), 다크 CTA |
| `Apply.tsx` | 수강신청 — Firestore 활성 폼 로드, 스텝별 폼 렌더, 제출 |
| `Blog.tsx` | 블로그 목록 — 카드 그리드(gridAutoRows 1fr, height 100%), 고정글 별도 섹션, FALLBACK_POSTS 내보냄 |
| `BlogPost.tsx` | 블로그 상세 — 대표이미지, 해시태그pill, 본문 마크다운 렌더(react-markdown), 밝은 CTA |
| `FormPage.tsx` | 외부 폼 페이지 (별도 경로, 관리자 아님) |

### src/pages/admin/
| 파일 | 역할 |
|------|------|
| `AdminLogin.tsx` | 관리자 로그인 페이지 (/admin) |
| `AdminSubmissions.tsx` | 신청현황 — 목록 + 상태(새신청/확인완료/상담완료) 변경, 바텀시트 상세, 토스트 피드백 |
| `AdminBanners.tsx` | 홍보배너 관리 — CRUD, 순서 변경(dirty state), 바텀시트 편집폼 |
| `AdminBlogList.tsx` | 블로그 목록 관리 — Firestore 글 목록, 수정/삭제 버튼 |
| `AdminBlogWrite.tsx` | 블로그 글 작성/수정 — 마크다운 에디터(작성/미리보기 탭), 태그/제목/요약/대표이미지 입력, 초안/발행 관리 |
| `FormBuilder.tsx` | 폼 편집기 — 섹션/질문 CRUD, DnD 순서 변경(dnd-kit), 질문 타입별 설정 |
| `Dashboard.tsx` | 미사용 대시보드 (레거시) |
| `Responses.tsx` | 미사용 응답 페이지 (레거시) |

### src/templates/
| 파일 | 역할 |
|------|------|
| `enrollmentTemplate.ts` | 수강신청 폼 기본 템플릿 데이터 |
| `quizTemplate.ts` | 퀴즈 폼 기본 템플릿 데이터 |

### src/assets/
| 파일 | 역할 |
|------|------|
| `hero.png` | 미사용 히어로 이미지 |
| `react.svg`, `vite.svg` | 미사용 기본 로고 |

---

## docs/  (읽는 문서)

| 경로 | 역할 |
|------|------|
| `../CONTEXT.md` | **용어 사전(글로서리)** — 도메인 용어 정의. 루트에 위치 |
| `PROJECT_MAP.md` | **이 파일** — 전체 파일 지도 |
| `STATUS.md` | 작업 현황 — 완료/미완료 항목 추적 |
| `adr/` | 결정 기록(ADR) — 왜 그렇게 했는가. `0001-spa-manual-ga-pageview.md` 등 |
| `DATA-MODEL.md` | Firestore 컬렉션 필드 구조 + 필드 주의사항 |
| `OPERATIONS.md` | 운영·배포 — 기술 스택·배포·이미지 관리 규칙 |
| `DEPENDENCY-MAP.md` | 연동 영향범위 — 사용자↔관리자 blast radius |
| `design/DESIGN.md` | 디자인 지침서 — YAML 토큰 + 컴포넌트·색상·타이포 스펙 (BMW 스타일) |
| `specs/APPLY_SPEC.md` | 수강신청 렌더링 스펙 (enrollment 3-step·설명회 경로) |
| `specs/COURSES_SPEC.md` | 수업소개 페이지 상세 스펙 (수업 데이터 단일 출처) |
| `specs/BLOG_SPEC.md` | 블로그 페이지 상세 스펙 |

---

## plan/  (작업 자산 — 문서 아님)

| 경로 | 역할 |
|------|------|
| `BANNER_IMAGE_PROMPT.md` | 홍보 배너 이미지 AI 생성 프롬프트 가이드 — 구도 규칙·주제별 프롬프트·등록 방법 |
| `redesign/인코딩플러스.dc.html` | **디자인 목업 원본** — 모든 페이지의 참고 기준 |
| `redesign/uploads/`, `ex/` | 리디자인 스크린샷·테마 HTML 등 스크래치 자산 |

---

## scripts/

| 파일 | 역할 |
|------|------|
| `resetEnrollmentForm.mjs` | Firestore 수강신청 폼 삭제 후 4섹션 구조로 재생성 |
| `setInitialViews.mjs` | 블로그 포스트 초기 조회수 일괄 설정 |

---

## source/

| 파일 | 역할 |
|------|------|
| `2027년도_특강안내.md` | **비즈니스 데이터 단일 출처** — Stats 수치, 배너 4개, 수업 과정 4개, 수강료, 상담전화. 코드 수치 변경 시 이 파일과 동기화. |
| `USAGE.md` | 기타 사용 안내 |

---

## public/

| 경로 | 역할 |
|------|------|
| `icons/` | PWA 아이콘 (192×192, 512×512 등) |
| `favicon.svg` | 파비콘 |
| `banners/` | 배너 배경 이미지 — Firestore `image` 필드에 `/banners/파일명` 으로 참조 |
| `blog/` | 블로그 대표 이미지 — Firestore `coverImage` 필드에 `/blog/파일명` 으로 참조 |
| `files/` | 다운로드 파일 (xlsx 등) — 마크다운에서 `/files/파일명` 으로 링크 |

---

## Firebase 컬렉션 → 코드 연결

| Firestore 컬렉션 | 읽는 파일 | 쓰는 파일 |
|----------------|---------|---------|
| `banners` | Home.tsx | AdminBanners.tsx |
| `blogPosts` | Blog.tsx, BlogPost.tsx, AdminBlogList.tsx | AdminBlogWrite.tsx |
| `submissions` | AdminSubmissions.tsx | Apply.tsx |
| `forms` | Apply.tsx, FormBuilder.tsx | FormBuilder.tsx |

---

## 주요 하드코딩 상수 위치

| 데이터 | 위치 |
|--------|------|
| Stats (212명/1위/37명/9년) | `Home.tsx` STATS |
| 배너 Fallback 4개 | `Home.tsx` FALLBACK_BANNERS |
| 수업 데이터 4개 | `Courses.tsx` SECTIONS |
| 블로그 Fallback 3개 | `Blog.tsx` FALLBACK_POSTS |
| 전형 안내 | `Courses.tsx` ADMISSION_INFO |
