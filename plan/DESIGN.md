---
version: 1.0
name: incodingplus-design
description: 디미고·특성화고 입시 전문 학원 인코딩플러스의 홍보 웹사이트. 학부모·학생을 주 대상으로 하는 신뢰감 있는 교육 브랜드 인터페이스. 연파란 body 배경 위에 흰 카드가 부유하고, 파란색 단일 계열(#2563eb 기준)이 모든 강조·CTA를 담당한다. Pretendard 800·700이 제목과 버튼을 잡고 400·500이 본문을 받친다. 수업소개·수강신청·블로그·홈 4개 섹션으로 구성된 단일 페이지 앱.

colors:
  primary: "#2563eb"
  primary-dark: "#1d4ed8"
  primary-darker: "#1e40af"
  primary-light: "#dbeafe"
  primary-lightest: "#eff6ff"
  primary-border: "#bfdbfe"
  primary-border-mid: "#93c5fd"
  primary-disabled: "#bfdbfe"
  ink: "#18181b"
  body: "#52525b"
  body-weak: "#71717a"
  body-muted: "#a1a1aa"
  placeholder: "#8c959f"
  canvas: "#ffffff"
  surface-body: "#eff6ff"
  surface-alt: "#f4f4f6"
  surface-soft: "#f9fafb"
  border: "#c8d0dc"
  border-soft: "#d4d9e0"
  on-primary: "#ffffff"
  on-dark: "#ffffff"
  success: "#22c55e"
  success-bg: "#dcfce7"
  danger: "#ef4444"
  danger-bg: "#fee2e2"
  warning-text: "#a16207"
  warning-bg: "#fef9c3"

typography:
  display-xl:
    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 26px
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.03em"
  display-lg:
    fontFamily: "'Pretendard', sans-serif"
    fontSize: 22px
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-0.03em"
  display-md:
    fontFamily: "'Pretendard', sans-serif"
    fontSize: 20px
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  display-sm:
    fontFamily: "'Pretendard', sans-serif"
    fontSize: 18px
    fontWeight: 800
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  title-lg:
    fontFamily: "'Pretendard', sans-serif"
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0"
  title-md:
    fontFamily: "'Pretendard', sans-serif"
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0"
  body-md:
    fontFamily: "'Pretendard', sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "0"
  body-sm:
    fontFamily: "'Pretendard', sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.55
    letterSpacing: "0"
  caption:
    fontFamily: "'Pretendard', sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0"
  label-en:
    fontFamily: "'Pretendard', sans-serif"
    fontSize: 11px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.06em"
  button:
    fontFamily: "'Pretendard', sans-serif"
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: "0"
  button-sm:
    fontFamily: "'Pretendard', sans-serif"
    fontSize: 13px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: "0"
  nav-link:
    fontFamily: "'Pretendard', sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0"

rounded:
  xs: 6px
  sm: 8px
  md: 10px
  lg: 12px
  xl: 14px
  xxl: 16px
  card: 16px
  pill: 999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 18px
  xl: 24px
  xxl: 32px
  section: 52px
  side: 18px

breakpoints:
  md: 900px

components:
  top-nav-user:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    height: "56px (mobile) / 72px (desktop)"
    borderBottom: "1px solid {colors.border}"
  top-nav-admin:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    height: 56px
    borderBottom: "1px solid {colors.border}"
  bottom-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.body}"
    height: 64px
    borderTop: "1px solid {colors.border}"
    mobileOnly: true
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "9px 18px"
  button-primary-disabled:
    backgroundColor: "{colors.primary-disabled}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    cursor: not-allowed
  button-secondary:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.body}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.sm}"
    padding: "9px 16px"
  button-danger:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.danger}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.sm}"
    border: "1px solid {colors.danger-bg}"
    padding: "9px 12px"
  card:
    backgroundColor: "{colors.canvas}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.card}"
    hoverShadow: "0 6px 20px rgba(37,99,235,0.13)"
    hoverTransform: "translateY(-2px)"
  badge-blue:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary-dark}"
    rounded: "{rounded.xs}"
    padding: "2px 8px"
    fontSize: 11px
    fontWeight: 700
  badge-success:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success}"
    rounded: "{rounded.xs}"
    padding: "2px 8px"
  badge-warning:
    backgroundColor: "{colors.warning-bg}"
    textColor: "{colors.warning-text}"
    rounded: "{rounded.xs}"
    padding: "2px 8px"
  hashtag-pill:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
    fontSize: 12px
    fontWeight: 700
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.border}"
    borderFocus: "1px solid {colors.primary}"
    rounded: "{rounded.md}"
    padding: "11px 14px"
    fontSize: 14px
  bottom-sheet-overlay:
    backgroundColor: "rgba(24,24,27,0.5)"
    mobileAlign: flex-end
    desktopAlign: center
  bottom-sheet-panel:
    backgroundColor: "{colors.canvas}"
    mobileRadius: "20px 20px 0 0"
    desktopRadius: "{rounded.xxl}"
    desktopMaxWidth: 640px
  section-header:
    bar: "28px × 3px, {colors.primary}, radius 999px"
    labelEn: "{typography.label-en}, {colors.primary}"
    titleKo: "{typography.display-xl}, {colors.ink}"
  banner-hero:
    textColor: "{colors.on-dark}"
    ctaButton: "background {colors.canvas}, color {colors.ink}"
    overlayGradient: "rgba(0,0,0,0.35→0.08)"
    overlayImage: "rgba(0,0,0,0.55→0.15)"
  blog-card:
    imageHeight: 150px
    backgroundColor: "{colors.canvas}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.card}"
  markdown-content:
    color: "#3f3f46"
    fontSize: 16px
    lineHeight: 1.8
    blockquoteBorder: "3px solid {colors.primary}"
    blockquoteBg: "{colors.surface-body}"
    codeBg: "{colors.surface-alt}"
    codeColor: "{colors.primary-dark}"
---

## 개요

인코딩플러스는 디미고·특성화고 입시를 전문으로 하는 학원의 홍보 웹사이트다. 학부모·학생을 대상으로 **신뢰감**과 **전문성**을 전달하는 것이 핵심 과제다.

배경은 `{colors.surface-body}` (#eff6ff, blue-50) — 순백이 아닌 연파란 캔버스가 브랜드의 교육적·차분한 분위기를 만든다. 그 위에 `{colors.canvas}` (#ffffff) 흰 카드들이 부유하며 계층을 형성한다. 어두운 hero 밴드는 배너 슬라이더 한 곳에만 등장한다.

색상은 **파란색 단일 계열**. `{colors.primary}` (#2563eb, blue-600)이 유일한 브랜드 액션 컬러다 — 버튼, 섹션 강조 바, 뱃지, 파란 바 모두 여기서 파생된다. 보라·인디고 계열 사용 금지.

타이포그래피는 **Pretendard 800/700/600/500/400** 다섯 웨이트. 제목은 800, 버튼·강조는 700, 네비·본문은 600/500이 담당한다. 자간은 제목에만 `-0.03em` 네거티브 트래킹을 적용해 짜임새를 더한다.

**핵심 특징:**
- 연파란 body 배경 + 흰 카드: 교육 브랜드의 차분하고 신뢰감 있는 분위기
- 파란색 단일 계열만 사용 — 파생 밝기/채도로만 계층 표현
- Pretendard 800/700 제목 + 500/400 본문 — 명확한 무게 대비
- 카드 border: `{colors.border}` (#c8d0dc) 1px — 섀도우 없이 테두리로 구분
- 모든 rounded는 `{rounded.xs}`(6px) ~ `{rounded.card}`(16px) 사이 — 부드러운 교육적 언어
- 섹션 제목: **파란 바(3px) + 영문 라벨 + 한글 제목** 3단 구조 (편집/작성 페이지 제외)

---

## 색상

### 브랜드 & 액션
- **Primary** (`{colors.primary}` — #2563eb): 모든 CTA 버튼, 섹션 파란 바, 강조 라벨, 링크. 유일한 브랜드 액션 컬러.
- **Primary Dark** (`{colors.primary-dark}` — #1d4ed8): 뱃지 텍스트, nav hover 색상, nav 활성 탭 텍스트.
- **Primary Darker** (`{colors.primary-darker}` — #1e40af): 강조 텍스트가 배경 위에서 더 선명해야 할 때.
- **Primary Light** (`{colors.primary-light}` — #dbeafe): 뱃지 배경, 활성 탭 배경, nav hover 배경, 해시태그 pill 배경.
- **Primary Lightest** (`{colors.primary-lightest}` — #eff6ff): 전체 body 배경, 정보 박스 배경, blockquote 배경.
- **Primary Border** (`{colors.primary-border}` — #bfdbfe): 인풋 포커스 테두리, 비활성 CTA 색상.
- **Primary Border Mid** (`{colors.primary-border-mid}` — #93c5fd): 버튼 테두리, 점선 강조.

### 서피스
- **Canvas** (`{colors.canvas}` — #ffffff): 카드, 모달, 네비게이션 바, 섹션 배경 기본.
- **Surface Body** (`{colors.surface-body}` — #eff6ff): 전체 페이지 body 배경. 순백이 아닌 연파란 캔버스.
- **Surface Alt** (`{colors.surface-alt}` — #f4f4f6): 보조 버튼 배경, 코드 인라인 배경, 섹션 헤더.
- **Surface Soft** (`{colors.surface-soft}` — #f9fafb): 비활성 상태 배경.

### 텍스트
- **Ink** (`{colors.ink}` — #18181b): 모든 제목, primary 텍스트. 순검정보다 따뜻한 zinc.
- **Body** (`{colors.body}` — #52525b): 기본 본문, 보조 버튼 텍스트.
- **Body Weak** (`{colors.body-weak}` — #71717a): 메타 정보, 부제목.
- **Body Muted** (`{colors.body-muted}` — #a1a1aa): 날짜, 조회수 등 최약 텍스트.
- **Placeholder** (`{colors.placeholder}` — #8c959f): 인풋 placeholder, 뒤로 버튼.
- **On Primary** (`{colors.on-primary}` — #ffffff): 파란 버튼 위 텍스트.
- **On Dark** (`{colors.on-dark}` — #ffffff): 배너 hero 밴드 위 텍스트.

### 테두리 / 구분선
- **Border** (`{colors.border}` — #c8d0dc): 카드 테두리, 인풋 기본 테두리, nav 하단선 기준.
- **Border Soft** (`{colors.border-soft}` — #d4d9e0): 아이템 간 구분선, step indicator 하단선.

### 시맨틱
- **Success** (`{colors.success}` / `{colors.success-bg}`): 활성 토글, 상담완료 뱃지.
- **Danger** (`{colors.danger}` / `{colors.danger-bg}`): 삭제 버튼, 오류 상태.
- **Warning** (`{colors.warning-text}` / `{colors.warning-bg}`): 새 신청 뱃지 (노란 계열).

---

## 타이포그래피

### 폰트
**Pretendard** (Korean-first variable-style webfont, 5 weights: 400·500·600·700·800).
Fallback: `-apple-system, BlinkMacSystemFont, sans-serif`.

영문 한자어 없이 한국어 중심 UI이기 때문에 별도 라틴 전용 폰트 없음. 영문 라벨(COURSES, BLOG 등)도 Pretendard 700로 처리하며 자간 `0.06~0.08em`을 추가해 라벨 감각을 낸다.

### 계층

| 토큰 | 크기 | 웨이트 | 행높이 | 자간 | 사용처 |
|------|------|--------|--------|------|--------|
| `{typography.display-xl}` | 26px | 800 | 1.25 | -0.03em | 섹션 한글 제목, 배너 타이틀 |
| `{typography.display-lg}` | 22px | 800 | 1.3 | -0.03em | 페이지 h1, stat 숫자 |
| `{typography.display-md}` | 20px | 800 | 1.3 | -0.02em | 수업 카드 제목 |
| `{typography.display-sm}` | 18px | 800 | 1.4 | -0.02em | 카드 그룹 제목 |
| `{typography.title-lg}` | 16px | 700 | 1.4 | 0 | 목록 제목, 블로그 카드 제목 |
| `{typography.title-md}` | 14px | 700 | 1.4 | 0 | 보조 제목, 버튼 레이블 |
| `{typography.body-md}` | 14px | 500 | 1.6 | 0 | 기본 본문, 설명 텍스트 |
| `{typography.body-sm}` | 13px | 500 | 1.55 | 0 | 보조 설명, 메타 |
| `{typography.caption}` | 12px | 400 | 1.4 | 0 | 날짜, 조회수, 뱃지 하단 |
| `{typography.label-en}` | 11px | 700 | 1.3 | 0.06em | COURSES, BLOG 등 영문 라벨 |
| `{typography.button}` | 14px | 700 | 1.0 | 0 | 기본 CTA 버튼 |
| `{typography.button-sm}` | 13px | 700 | 1.0 | 0 | 보조 버튼, 작은 액션 |
| `{typography.nav-link}` | 14px | 600 | 1.4 | 0 | 네비게이션 링크 |

### 원칙
- **800/700 제목, 500/400 본문** — 중간값 600은 nav·label 전용 좁은 레인.
- **제목만 네거티브 트래킹** — `-0.03em`이 한국어 제목의 짜임새를 높인다. 본문에는 절대 적용 안 함.
- **영문 라벨은 uppercase + 넓은 자간** — `letterSpacing: 0.06~0.08em`으로 라벨 감각 부여. `text-transform: uppercase`는 CSS로 적용하지 않고 문자열 자체를 대문자로.
- **줄높이 1.55~1.6** — 본문의 넉넉한 호흡. 제목은 1.25~1.4로 타이트하게.

---

## 레이아웃

### 스페이싱 시스템
기본 단위 4px. 주요 사용값: 4·8·12·16·18·24·32·52px.
- **사이드 패딩**: 모바일 `{spacing.side}` (18px) 고정.
- **섹션 수직 패딩**: `{spacing.section}` (52px).
- **카드 내부**: 16~24px.

### 그리드 & 컨테이너
- **전체 배경**: 뷰포트 100% 흰 박스 — 양 옆 회색 노출 금지.
- **콘텐츠 최대 너비**: `md:max-w-[1100px] md:mx-auto` (내부 컨테이너).
- **블로그 본문**: `md:max-w-[720px]`.
- **모델 카드 그리드**: 모바일 1열 → 데스크탑 2~3열.
- **블로그 카드 그리드**: `gridAutoRows: '1fr'` — 행 높이 통일 필수. 카드 `height: 100%`.

### 여백 철학
카드 사이 간격보다 카드 내부 공백을 넉넉하게. 섹션 간 52px로 충분한 호흡. 카드 내부 16~20px. BottomNav 위 여백은 CSS 클래스로 처리 — inline style에 계산식 쓰지 않음.

---

## 엘리베이션 & 깊이

| 레벨 | 처리 | 사용처 |
|------|------|--------|
| Flat | 테두리 없음, 그림자 없음 | body 배경, nav |
| Hairline | 1px `{colors.border}` 테두리 | 카드 기본, 인풋 |
| Hover Card | `0 6px 20px rgba(37,99,235,0.13)` + translateY(-2px) | hover-card 클래스 |
| Overlay | `rgba(24,24,27,0.5)` | Bottom Sheet 배경 |
| Hero Dark | 배경 그라데이션(진파랑~네이비) + 오버레이 | 배너 슬라이더 |

드롭 섀도우는 hover 상태에만, 그것도 파란색 색조 섀도우만 사용. 일반 회색 box-shadow 사용 금지.

---

## 형태 (Shapes)

### 테두리 반경

| 토큰 | 값 | 사용처 |
|------|----|--------|
| `{rounded.xs}` | 6px | 뱃지, 작은 태그 |
| `{rounded.sm}` | 8px | 보조 버튼, 삭제 버튼 |
| `{rounded.md}` | 10px | CTA 버튼, 인풋, step indicator 내부 |
| `{rounded.lg}` | 12px | 필드 컨테이너, 마크다운 이미지 |
| `{rounded.xl}` | 14px | 섹션 카드 |
| `{rounded.card}` | 16px | 기본 카드, Blog 카드 |
| `{rounded.pill}` | 999px | 해시태그 pill, 파란 바, dot |
| Desktop Sheet | 16px | Bottom Sheet (데스크탑) |
| Mobile Sheet | 20px 20px 0 0 | Bottom Sheet (모바일 상단 두 모서리만) |

카드는 항상 `{rounded.card}` (16px). 버튼은 목적에 따라 `{rounded.md}`(CTA) 또는 `{rounded.sm}`(보조/삭제). 직각(0px)은 사용 안 함 — 브랜드의 친근한 교육 언어.

---

## 컴포넌트

### 네비게이션

**`top-nav-user`** — 사용자용 상단 바. `{colors.canvas}` 배경, 하단 `1px {colors.border}`. 높이 56px(모바일) / 72px(데스크탑). 좌측: 로고(`인코딩플러스+`). 우측: 메뉴 링크 4개(홈·수업소개·블로그·수강신청) + 모바일 햄버거. 로고의 `+`는 `{colors.primary}` (#2563eb).

**`top-nav-admin`** — 관리자용 상단 바. 동일 배경·높이. 좌측: 로고 + `관리자` 뱃지(blue-100 배경, blue-700 텍스트). 우측: 탭 5개(신청현황·폼편집·홍보배너·블로그·홈으로) + 모바일 햄버거.

**`bottom-nav`** — 모바일 전용, fixed bottom. `{colors.canvas}` 배경, 상단 `1px {colors.border}`. 높이 64px. 아이콘 + 레이블 4탭. `env(safe-area-inset-bottom)` 적용 필수. 활성 탭: `{colors.primary-light}` 배경 + `{colors.primary-dark}` 텍스트 + 700 weight.

### 버튼

**`button-primary`** — 기본 CTA. 배경 `{colors.primary}`, 텍스트 `{colors.on-primary}`, `{typography.button}`, padding 9px×18px, `{rounded.md}` (10px). hover: `hover-btn` 클래스 (brightness 0.9 + translateY -1px).

**`button-primary-disabled`** — 비활성 상태. 배경 `{colors.primary-disabled}` (#bfdbfe), 텍스트 흰색, cursor not-allowed. 파란 계열 유지 — 회색으로 바꾸지 않음.

**`button-secondary`** — 보조 액션. 배경 `{colors.surface-alt}` (#f4f4f6), 텍스트 `{colors.body}`, `{typography.button-sm}`, `{rounded.sm}`.

**`button-danger`** — 삭제·위험. 배경 흰색, 텍스트 `{colors.danger}`, 테두리 `1px {colors.danger-bg}`, `{rounded.sm}`.

**`button-choice`** — 동등한 두 선택지 버튼 (택일 UI). 배경 `{colors.primary-lightest}` (#eff6ff), 테두리 `1px {colors.primary-border}` (#bfdbfe), 텍스트 `{colors.primary-dark}` (#1d4ed8), `{rounded.md}`. 두 버튼 모두 동일한 스타일 — primary/secondary 계층 금지 (하나가 이미 선택된 것처럼 보임).

### 카드

**`card`** — 기본 카드. 배경 `{colors.canvas}`, 테두리 `1px {colors.border}`, `{rounded.card}` (16px). `hover-card` 클래스로 hover 효과: 파란 섀도우 + -2px 부상. 섀도우 색: `rgba(37,99,235,0.13)`.

관리자 카드 변형:
- 활성 폼: `border: 1px solid #86efac` (초록)
- 고정 포스트: `border: 2px solid {colors.primary}`

### 섹션 헤더

모든 목록 페이지, 홈 섹션에 적용. 편집/작성 페이지(FormBuilder, AdminBlogWrite)는 제외.

```
[파란 바 28×3px, border-radius 999px, #2563eb]
[영문 라벨 — 11px / 700 / 0.06em 자간 / #2563eb]
[한글 제목 — 26px / 800 / -0.03em / #18181b]
[부제 (선택) — 14px / 500 / #71717a]
```

### 뱃지 / 태그

**`badge-blue`** — 기본 파란 뱃지. 배경 `{colors.primary-light}`, 텍스트 `{colors.primary-dark}`, `{rounded.xs}` (6px), padding 2px×8px, 11px/700.

**`badge-success`** — 상담완료, 활성. 배경 `{colors.success-bg}`, 텍스트 `{colors.success}`.

**`badge-warning`** — 새 신청. 배경 `{colors.warning-bg}`, 텍스트 `{colors.warning-text}` (노란-갈색 계열).

**`hashtag-pill`** — 블로그 태그. 배경 `{colors.primary-light}`, 텍스트 `{colors.primary}`, `{rounded.pill}` (999px), padding 4px×12px, 12px/700.

### 인풋

**`text-input`** — 배경 `{colors.canvas}`, 테두리 `1px {colors.border}` → focus시 `1px {colors.primary}`. `{rounded.md}` (10px), padding 11px×14px, 14px. `outline: none`. 자바스크립트 onFocus/onBlur 핸들러로 테두리 색 전환.

**필드 컨테이너** — 배경 `{colors.canvas}`, 테두리 `1px {colors.border}`, `{rounded.lg}` (12px), padding 16px×18px. 상단에 12px/700 라벨.

### Bottom Sheet

**`bottom-sheet-overlay`** — `position: fixed; inset: 0; background: rgba(24,24,27,0.5)`. 모바일: `justify-content: flex-end`. 데스크탑: `justify-content: center; align-items: center`. **overlay에 maxWidth 넣으면 배경 어둠이 잘림 — 절대 금지.**

**`bottom-sheet-panel`** — 배경 `{colors.canvas}`. 모바일: `border-radius: 20px 20px 0 0`, `max-height: 88vh`, `padding-bottom: env(safe-area-inset-bottom)`. 데스크탑: `border-radius: 16px`, `max-width: 640px`, `max-height: 80vh`. **반드시 CSS 클래스로 — inline style 금지.**

### 배너 (Hero Slider)

**`banner-hero`** — 전체 너비 어두운 hero 밴드. 그라데이션 또는 이미지 배경. 이미지 우선(`image` 필드 있으면 `bg` 무시). 텍스트·버튼 전부 흰색. CTA 버튼은 역전 — `background: #fff, color: #18181b`. 오버레이: 그라데이션 `rgba(0,0,0,0.35~0.08)`, 이미지 `rgba(0,0,0,0.55~0.15)`.

배경 그라데이션 프리셋:
```
진파랑:    linear-gradient(135deg, #002B5C 0%, #2563eb 100%)
네이비:    linear-gradient(135deg, #001233 0%, #003580 100%)
미드블루:  linear-gradient(135deg, #0f4c75 0%, #1b6ca8 100%)
딥블루:    linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)
스카이:    linear-gradient(135deg, #1d4ed8 0%, #06b6d4 100%)
하늘:      linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)
라이트블루: linear-gradient(135deg, #0ea5e9 0%, #93c5fd 100%)
다크:      linear-gradient(135deg, #18181b 0%, #374151 100%)
```

### 블로그 카드

**`blog-card`** — 대표 이미지(150px 고정) + `#태그` + 제목 + 요약 + 날짜·조회수. 배경 `{colors.canvas}`, 테두리 `1px {colors.border}`, `{rounded.card}`. 그리드 `gridAutoRows: '1fr'` + 카드 `height: 100%` 필수. 요약은 line-clamp 없이 전체 표시, `flex: 1`로 남은 공간 흡수.

### 마크다운 (블로그 본문)

**`markdown-content`** — `md-preview` CSS 클래스. 본문 색 `#3f3f46`, 16px/1.8. h1: 22px/800, h2: 18px/700, h3: 16px/700. blockquote: `border-left: 3px solid {colors.primary}`, 배경 `{colors.surface-body}`. code: 배경 `{colors.surface-alt}`, 텍스트 `{colors.primary-dark}`. 이미지: `border-radius: 12px`.

---

## 로고

```
인코딩플러스+
```
- `인코딩플러스` — `{colors.ink}` (#18181b), fontWeight 800
- `+` — `{colors.primary}` (#2563eb), 동일 weight·size
- 모바일 18px / 데스크탑 21px
- 관리자: 텍스트 뒤에 `관리자` 뱃지 — `{colors.primary-light}` 배경 + `{colors.primary-dark}` 텍스트, `{rounded.xs}`.

---

## CSS 유틸리티

| 클래스 | 동작 |
|--------|------|
| `hover-card` | shadow(`rgba(37,99,235,0.13)`) + translateY(-2px), transition 0.2s |
| `hover-btn` | brightness(0.9) + translateY(-1px), transition 0.15s |
| `nav-btn` | hover시 배경 `{colors.primary-light}`, 텍스트 `{colors.primary-dark}` |
| `dark-cta-bottom` | 모바일: padding-bottom에 BottomNav(64px) + safe-area 포함 |
| `apply-btn-area` | 수강신청 하단 버튼 영역 — BottomNav 위 노출 |
| `step-indicator` | sticky top:56px(모바일)/72px(데스크탑), blur backdrop |
| `course-sheet-overlay` | Bottom Sheet 오버레이 (반응형) |
| `course-sheet-panel` | Bottom Sheet 패널 (반응형) |
| `blog-list-bottom` | 블로그 목록 하단 BottomNav 여백 |
| `md-preview` | 마크다운 렌더링 스타일 |

---

## Do's and Don'ts

### Do
- body 배경은 항상 `{colors.surface-body}` (#eff6ff) — 순백 금지.
- CTA는 `{colors.primary}` (#2563eb) + 흰 텍스트 + `{rounded.md}` (10px).
- 카드 테두리는 항상 `1px {colors.border}` (#c8d0dc) — 섀도우로 대체 금지.
- 섹션 제목은 파란 바(3px) + 영문 라벨 + 한글 제목 3단 구조.
- 카드 hover는 반드시 `hover-card` 클래스 사용.
- Bottom Sheet는 CSS 클래스 (`course-sheet-overlay`, `course-sheet-panel`) 사용.
- 블로그 카드 그리드는 `gridAutoRows: '1fr'` + 카드 `height: 100%`.
- BottomNav safe area는 CSS 클래스로 처리.
- 비활성 버튼도 파란 계열 유지 (`{colors.primary-disabled}`).

### Don't
- 보라·인디고 계열 색상 사용 금지 — 파란색 계열만.
- 카드·버튼에 직각(border-radius: 0) 사용 금지.
- overlay에 `maxWidth` inline style 금지 — 배경 어둠이 잘림.
- 회색 box-shadow 사용 금지 — hover 파란 섀도우만 허용.
- 본문 텍스트에 네거티브 트래킹(-0.03em 등) 적용 금지.
- 폼 편집/글쓰기 페이지(FormBuilder, AdminBlogWrite)에 섹션 파란 바 추가 금지.
- 배너 CTA 버튼에 파란색 사용 금지 — 어두운 배경 위에서는 흰 버튼 + 검은 글씨.

---

## 반응형

### 브레이크포인트

| 이름 | 너비 | 주요 변화 |
|------|------|-----------|
| 모바일 | < 900px | BottomNav 노출, TopNav 56px, 사이드 padding 18px, 카드 1열 |
| 데스크탑 | ≥ 900px | BottomNav 숨김, TopNav 72px, 콘텐츠 max-w-[1100px] 중앙 정렬, 카드 2~3열 |

Tailwind 커스텀: `--breakpoint-md: 900px` (기본 768px 아님 — 주의).

### 터치 타겟
- `{component.button-primary}` 최소 44×44px.
- `{component.bottom-nav}` 탭 영역 최소 48px.
- `{component.text-input}` 높이 최소 44px.

### 이미지 동작
- 배너 이미지: `backgroundSize: cover`, `backgroundPosition: center`.
- 블로그 대표 이미지: 150px 고정 높이, `objectFit: cover`.
- 블로그 본문 이미지: 100% 너비, `border-radius: 12px`.
