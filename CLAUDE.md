# 인코딩플러스 개발 규칙

> Claude Code 세션마다 자동 로드되는 운영 지침. 역할 분리:
> - 디자인 스펙 → `plan/DESIGN.md`
> - 파일 지도 → `plan/PROJECT_MAP.md`
> - 작업 현황 → `plan/STATUS.md`
> - 페이지별 스펙 → `plan/specs/`

---

## 기술 스택

- **React 18 + TypeScript + Vite**
- **Tailwind v4** (커스텀 breakpoint: `md:` = 900px)
- **Firebase Firestore** (DB), Firebase Auth (관리자)
- **폰트**: Pretendard (400/500/600/700/800)
- **라우터**: React Router v6

---

## 배포

- **호스팅**: Vercel — GitHub `main` 브랜치 push → 자동 배포 (별도 명령어 불필요)
- **Firestore Rules 변경 시에만**: `firebase deploy --only firestore:rules`
- **GitHub**: `https://github.com/jisoo-git/encodingplus`
- **배포 URL**: `https://encodingplus.vercel.app/`
- **GitHub 인증**: macOS 키체인 (`security find-internet-password -s github.com -w`) → REST API 직접 호출 가능

---

## Firebase 컬렉션 구조

| 컬렉션 | 문서 필드 |
|--------|---------|
| `banners` | `{ badge, title, sub, bg, image?, cta, link, order }` |
| `blogPosts` | `{ tag, title, excerpt, coverImage, content: string, date, read, pinned?, published?, views? }` |
| `submissions` | enrollment: `{ name, course, school, phone, formId, status, submittedAt, detail }` / 범용: `{ formId, formTitle, name?, phone?, school?, status, submittedAt, detail }` |
| `forms` | `{ title, description, type, isActive, createdAt, sections: Section[] }` |

- `banners.image`: 배경 이미지 URL (없으면 `bg` 그라데이션)
- `blogPosts.content`: **마크다운 string** (ContentBlock[] 아님)
- `forms`: REST API로 직접 생성 시 **`createdAt` 필수** — `useForms`가 `orderBy('createdAt')` 사용

---

## 이미지 관리 규칙

이미지는 `public/` 폴더에 저장 → Firestore에 절대 경로 입력. Vite가 루트로 서빙.

| 용도 | 폴더 | 입력값 예시 |
|------|------|------------|
| 배너 배경 | `public/banners/` | `/banners/banner1.png` |
| 블로그 대표 이미지 | `public/blog/` | `/blog/이미지명.jpg` |
| 다운로드 파일 | `public/files/` | `/files/파일명.xlsx` |

외부 URL(네이버 등) 핫링크 차단으로 사용 불가. 파일명 공백 제거 필수.

---

## Apply.tsx 폼 렌더링 구조

`?type=` URL 파라미터와 Firestore `forms.type` 필드로 렌더 방식 결정.

| 조건 | `isEnrollment` | 렌더 방식 |
|------|---------------|----------|
| `?type=` 없음, `isActive` 폼 type = enrollment | `true` | 3-step 하드코딩 |
| `?type=enrollment` | `true` | 동일 |
| `?type=seminar` 등 enrollment 외 | `false` | 섹션별 step (1섹션 = 1스텝) |

**enrollment 3-step 규칙**:
- Step 1: 개인정보 동의(하드코딩) + 수업 선택(COURSE_OPTIONS) + 신청 확인 섹션 info 질문
- Step 2: 유의사항 섹션 info 질문 + 확인 체크박스
- Step 3: 선택한 수업명과 일치하는 섹션 질문들
- 섹션 제목 매칭 키워드 정확히 일치 필수: `유의사항` / `입시 단기특강` / `일반전형 특강`

---

## 사용자 ↔ 관리자 연동 체크리스트

사용자 페이지와 관리자 페이지가 같은 Firestore 데이터를 공유한다.
**한쪽을 수정하면 반드시 다른 쪽 영향 여부를 확인할 것.**

| 기능 | 사용자 | 관리자 | 연동 포인트 |
|------|--------|--------|------------|
| 배너 | `Home.tsx` | `AdminBanners.tsx` | `banners` 컬렉션, `link` 필드 라우팅 |
| 신청 폼 | `Apply.tsx` | `AdminFormList.tsx` / `FormBuilder.tsx` | `forms` 컬렉션, `type`·`isActive` |
| 신청 현황 | `Apply.tsx` (제출 구조) | `AdminSubmissions.tsx` | `submissions` 컬렉션 필드 구조 |
| 블로그 | `Blog.tsx` / `BlogPost.tsx` | `AdminBlogList.tsx` / `AdminBlogWrite.tsx` | `blogPosts` 컬렉션, `published`·`pinned` |

---

## 자주 실수하는 것

1. `blogPosts.content`는 **마크다운 string** — `ContentBlock[]` 아님
2. 카드 hover: `className="hover-card"` 붙여야 동작
3. BottomNav safe area: `env(safe-area-inset-bottom, 0px)` 필수
4. 관리자 Bottom Sheet: overlay에 maxWidth 넣지 말 것 (배경 어둠 잘림)
5. 블로그 페이지 제목: **"입시 블로그"** ("디미고 입시 블로그" 금지)
6. 배너 CTA 버튼 레이블: `b.cta` 직접 사용
7. 블로그 카드 그리드: `gridAutoRows: '1fr'` + 카드 `height: 100%` 필수
8. `forms` REST API 직접 생성 시 `createdAt` 없으면 목록 안 뜸
9. enrollment 폼 섹션 제목은 Apply.tsx 키워드와 **정확히** 일치: `유의사항` / `입시 단기특강` / `일반전형 특강`
