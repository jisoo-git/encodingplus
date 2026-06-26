# 인코딩플러스 개발 규칙

> Claude Code 세션마다 자동으로 로드되는 개발 지침서.
> 페이지별 상세 스펙은 `plan/specs/` 폴더 참조.
> 디자인 목업 원본은 `plan/redesign/인코딩플러스.dc.html`.

---

## 기술 스택

- **React 18 + TypeScript + Vite**
- **Tailwind v4** (커스텀 breakpoint: `md:` = 900px)
- **Firebase Firestore** (DB), Firebase Auth (관리자)
- **폰트**: Pretendard (400/500/600/700/800)
- **라우터**: React Router v6

## 배포

- **호스팅**: Vercel
- **방식**: GitHub `main` 브랜치에 push → Vercel 자동 배포 (별도 명령어 불필요)
- **Firebase**: Firestore Rules 변경 시에만 `firebase deploy --only firestore:rules` 별도 실행 필요

---

## 색상 시스템 (Blue-600 기준)

> Tailwind blue 팔레트 기준. 주색 계열은 파란색만 사용할 것.

| 역할 | 값 | Tailwind | 사용처 |
|-----|-----|----------|--------|
| 주색 (CTA) | `#2563eb` | blue-600 | 버튼, 강조 레이블 |
| 주색 어둠 | `#1d4ed8` | blue-700 | 뱃지 텍스트, hover |
| 주색 더 어둠 | `#1e40af` | blue-800 | 강조 텍스트 |
| 주색 연함 | `#dbeafe` | blue-100 | 뱃지 배경, 활성 탭 |
| 주색 최연함 | `#eff6ff` | blue-50 | 정보 박스, body 배경 |
| 주색 테두리 | `#bfdbfe` | blue-200 | 인풋 포커스 테두리 |
| 주색 중간 테두리 | `#93c5fd` | blue-300 | 버튼 테두리, 점선 |
| 비활성 CTA | `#bfdbfe` | blue-200 | 저장 중... 버튼 |
| 텍스트 기본 | `#18181b` | zinc-900 | 제목, 본문 |
| 텍스트 보조 | `#52525b` | zinc-600 | 서브텍스트 |
| 텍스트 약함 | `#71717a` | zinc-500 | 메타 정보 |
| 텍스트 최약 | `#8c959f` | — | 플레이스홀더 |
| 배경 (전체) | `#eff6ff` | blue-50 | body (연파랑) |
| 배경 (카드) | `#fff` | white | 카드, 시트 |
| 배경 (버튼 보조) | `#f4f4f6` | — | 보조 버튼 |
| 구분선 | `#e3e8ee` / `#ececef` | — | border |
| 성공 | `#22c55e` / `#dcfce7` | green | 활성 토글 |
| 경고 | `#ef4444` / `#fee2e2` | red | 삭제 |
| 주의 | `#fef9c3` / `#a16207` | yellow | 새 신청 상태 |

---

## 레이아웃 원칙

### 모바일 (< 900px)
- 최대 너비 없음, 풀 폭
- BottomNav (높이 64px) 위에 콘텐츠 마진 확보
- `env(safe-area-inset-bottom)` 적용

### 데스크탑 (≥ 900px)
- 콘텐츠 최대 너비: `md:max-w-[1100px] md:mx-auto`
- 블로그 상세: `md:max-w-[720px]`
- TopNav 높이 72px (모바일 56px)

### 컴포넌트 최대 너비
- 카드 그리드: 1100px
- 블로그 글 본문: 720px
- 관리자 패널: 440px (AdminLayout 내부)
- Bottom Sheet (admin): 440px 이하 중앙 정렬

---

## 컴포넌트 패턴

### 카드
```
hover-card CSS 클래스 (index.css) — shadow + translateY(-2px)
border: 1px solid #ececef
border-radius: 14~16px
background: #fff
```

### Bottom Sheet (course, admin 공통)
- CSS 클래스 사용: `.course-sheet-overlay` / `.course-sheet-panel`
- 모바일: 하단 시트 (border-radius: 20px 20px 0 0)
- 데스크탑: 중앙 다이얼로그 (max-width: 640px, border-radius: 16px)
- **inline style maxWidth를 overlay에 넣으면 배경 어둠이 잘림** → 반드시 CSS 클래스 사용

### 버튼
```
CTA 기본: background #2563eb, color #fff, border-radius 10~12px
보조: background #f4f4f6, color #52525b
위험: background #fff, border 1px solid #fee2e2, color #ef4444
hover-btn CSS 클래스 (index.css)
```

### 뱃지 / 태그
```
파란 뱃지: background #dbeafe, color #1d4ed8, border-radius 6~8px
해시태그 pill: border-radius 999px
```

### 인풋 포커스
```
onFocus → borderColor #2563eb
onBlur → borderColor #c8d0dc
```

---

## 네비게이션

### 사용자 (UserLayout)
- **TopNav**: 모바일 56px / 데스크탑 72px, sticky top:0
- **BottomNav**: 모바일만, fixed bottom:0, 높이 64px
- **Drawer**: 모바일 사이드 드로어 (TopNav 햄버거 버튼)
- 두 개 모두 운영 (BottomNav + Drawer)

### 관리자 (AdminLayout)
- 최대 너비 440px 중앙 정렬
- 상단 바: 고정, 높이 56px
- 데스크탑: 서브탭 (sticky top:56)
- 모바일: BottomNav 탭 4개 (신청현황/폼편집/홍보배너/블로그)

---

## Firebase 컬렉션

| 컬렉션 | 문서 구조 |
|--------|---------|
| `banners` | `{ badge, title, sub, bg, image?, cta, link, order }` |
| `blogPosts` | `{ tag, title, excerpt, coverImage, content: string, date, read, pinned?, published?, views? }` |
| `submissions` | `{ name, course, school, phone, status, submittedAt, detail }` |
| `forms` | `{ title, description, type, isActive, sections: Section[] }` |

`banners.image`: 배경 이미지 URL (없으면 `bg` 그라데이션 사용)  
`blogPosts.content`: **마크다운 문자열** (react-markdown으로 렌더링)

---

## 주요 하드코딩 수치 (source/2027년도_특강안내.md 기준)

- 합격 실적: **212명 · 1위 · 37명 · 9년**
- 상담 전화: **010-2838-2391**
- 개강일: 2027학년도 **7월 18일**
- 수강료: COURSE 01 **73만원/월** · COURSE 02 **48만원/월**

---

## 페이지별 스펙 위치

| 페이지 | 스펙 |
|--------|------|
| 수업소개 | `plan/specs/COURSES_SPEC.md` |
| 블로그 | 이 문서 (아래) |

### 블로그 규칙

- **제목**: "입시 블로그" (X "디미고 입시 블로그")
- **부제**: "디미고·특성화고 입시 정보와 합격 노하우"
- **카테고리 없음** → 글마다 메인 해시태그 1개 (`tag` 필드)
- 카드: 대표 이미지(150px) + `#태그` + 제목 + 요약 + 날짜
- 상세: 대표 이미지(210px, border-radius 14) + 해시태그 pill (border-radius 999px) + 본문 블록
- **하단 CTA**: 밝은 카드 스타일 ("우리 아이 입시가 고민되시나요?") — 다크 스타일 사용 금지

---

## 자주 실수하는 것

1. `blogPosts.content`는 **마크다운 string** — `ContentBlock[]` 아님
2. 카드 hover: `className="hover-card"` 붙여야 동작
3. BottomNav safe area: CSS `env(safe-area-inset-bottom, 0px)` 필수
4. 관리자 Bottom Sheet: overlay에 maxWidth 넣지 말 것 (배경 어둠이 잘림)
5. 블로그 제목 "디미고 입시 블로그" → **"입시 블로그"**
6. 배너 CTA 버튼 레이블: `b.cta` 직접 사용
7. 블로그 카드 그리드: `gridAutoRows: '1fr'` + 카드에 `height: 100%` 필수 (행 높이 통일)
8. Firestore `forms` 컬렉션: REST API로 직접 생성 시 **`createdAt: timestampValue`** 필수 → `useForms`가 `orderBy('createdAt')` 사용, 없으면 목록에 안 뜸
9. enrollment 폼 섹션 제목은 Apply.tsx 검색 키워드와 **정확히** 일치해야 함: `유의사항` / `입시 단기특강` / `일반전형 특강`
