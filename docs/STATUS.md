# 인코딩플러스 작업 현황 (2026-06-28)

---

## 현재 구현 상태

### 사용자 페이지
- **홈**: 배너 슬라이더(Firestore/fallback), Stats(디미고 강조), WHY, 입시특강 2종 프리뷰, 설명회 섹션, 하단 CTA(DarkCTAFooter 공통 컴포넌트)
  - 배너 슬라이더: **이미지 전용** (텍스트 오버레이 제거, `backgroundImage` + `backgroundColor` 분리 방식)
  - 우상단 CTA 버튼: `b.cta` 텍스트가 있을 때만 표시, 클릭 시 `b.link`로 이동
    - 흰 배경 + 검정 텍스트 + 그림자, 반응형 크기 (`banner-cta-btn` 클래스)
    - 관리자 배너 편집에서 버튼 텍스트 직접 입력, 비워두면 버튼 없음
  - 좌우 중앙: ‹ › 슬라이드 이동 버튼 (`banner-arrow` 클래스, 반투명 흰색, 데스크탑 48px / 모바일 32px)
  - 우하단: 배너 카운터 (`{현재} / {전체}` 형식, 배너 이미지 위에 오버레이)
  - 하단: 도트 인디케이터 (클릭으로 특정 배너 바로 이동)
  - 스와이프: 터치(모바일) + 마우스 드래그(데스크탑) 모두 지원
  - FALLBACK_BANNERS: `/banners/banner1~5.png` 참조
- **수업소개**: CourseFullCard 전면 표시, 카드 높이 행별 통일(flex stretch), 하단 CTA(DarkCTAFooter)
- **수강신청**: enrollment 3-step 하드코딩 / 범용 폼 섹션별 step, branching(`__end__` 차단·섹션 점프), 제출 저장
- **블로그**: 핀 고정글 상단 분리, 카드 그리드(`gridAutoRows: 1fr`), 마크다운 상세, 조회수 카운트, 하단 CTA(DarkCTAFooter)
- **BottomNav 신청 탭**: 탭 클릭 시 선택 시트 — 수강신청 / 설명회 신청 분기
  - 시트 드래그 닫기: 아래로 80px 이상 드래그 시 닫힘, 미만이면 원위치 복귀
- **Drawer**: 카카오채널상담 링크 추가, 로고 이미지 + 텍스트 조합으로 변경

### 공통 UI
- **네비게이션 로고**: 로고 이미지(`/icon/incodingplus_logo.png`, 고정 파일) + "인코딩플러스" 텍스트 나란히 배치
  - TopNav 모바일 28px / 데스크탑 32px, Drawer 26px
  - Favicon도 동일 이미지(`index.html` `<link rel="icon">`)로 설정

### 공통 컴포넌트
- **DarkCTAFooter** (`src/components/DarkCTAFooter.tsx`): 홈·수업소개·블로그 하단 공유
  - 전화상담 링크(위) + [수강 신청하기 파란버튼] + [카카오 채널 상담 노란버튼] 나란히
  - `dark-cta-bottom` 클래스로 BottomNav safe-area 패딩 처리

### 관리자 페이지
- **인증**: `/admin/login` 페이지 — 비밀번호 입력 후 `localStorage` 세션 유지, `ProtectedRoute`로 전체 admin 라우트 보호
  - 비밀번호: `.env.local`의 `VITE_ADMIN_PASSWORD` (Vercel 환경변수에도 동일 설정 필요)
- **신청현황**: 상태 관리(새신청/확인완료/상담완료), 폼별 필터 pill, 상태 탭 건수, 상세 시트(전화번호·응답 그리드)
- **폼편집**: FormBuilder CRUD, DnD 순서, 질문 타입 12종
- **홍보배너**: CRUD, 순서 변경(dirty state), **이미지 전용 UI** (이미지 URL + 16:9 미리보기 + 버튼 텍스트 + 링크 선택)
  - 저장 필드: `{ image, link, cta, badge:'', title:'', sub:'', bg:'' }`
  - 버튼 텍스트(`cta`) 입력란: 비워두면 배너에 버튼 없음, 입력 시 우상단에 버튼 표시
  - 배너 등록 방법: `public/banners/파일명.png` 저장 → 관리자 URL 입력
- **블로그**: 3열 그리드 카드, 마크다운 에디터(작성/미리보기), 초안/발행, 핀 토글

### 배너 이미지 제작
- AI 생성 가이드: `plan/BANNER_IMAGE_PROMPT.md` (ChatGPT / DALL-E 3, 1792×1024)
- 색상 옵션 A~H: 사이트 테마 기반 8종 (스카이블루/네이비+스카이/딥네이비/브랜드블루 등)
- 생성 프롬프트 5종 제공: 디미고 입시 특강 / 합격 실적 / 전형 안내 / 상담 문의 / 커스텀
- 배너 이미지 위치: `public/banners/banner1~17.png` (커밋 완료)

### 인프라
- Firestore 컬렉션: `banners` / `blogPosts` / `submissions` / `forms` 운영 중
- Firestore 보안 규칙: `/{document=**}` 전체 허용 (개발 단계)
- 배포: Vercel, main 브랜치 push → 자동 배포
- 이미지: `public/` 폴더 로컬 저장 + Firestore 절대경로 입력 방식 (`/banners/파일명.png`)

---

## 최근 변경 (2026-07-11)

- **설명회 신청 비활성화**: `SEMINAR_APPLY_ENABLED = false` 플래그(`src/forms/routes.ts`)로 설명회 신청 기능을 코드 레벨에서 껐다. 코드는 삭제하지 않고 플래그만 `true`로 되돌리면 원상복구된다.
  - 숨김: 홈 진입 팝업(더 이상 뜨지 않음, dismiss-key useEffect도 gating), 홈 SECTION 5 "설명회" 섹션, `/start` 허브의 "설명회 신청" 카드(부제 문구도 플래그에 맞춰 "상담 예약 · 수강 신청을 한 곳에서"로 전환)
  - 차단: `/apply?type=seminar` 별칭 접근과 설명회 formId(`settings/apply.seminarFormId` 또는 legacy `forms.type === 'seminar'`) 직접 링크 접근 → `Apply.tsx`가 "설명회 신청이 마감되었습니다" 안내 화면으로 대체
  - Firestore 데이터·설정은 변경하지 않음. 상세는 [specs/APPLY_SPEC.md](specs/APPLY_SPEC.md#seminar-apply-feature-flag) 참고.
- **네이버 블로그 글 2건 이전**: "디미고 도전을 앞둔 중3에게", "디미고 특별전형 준비, 프로젝트 발표수업" — `blogPosts` 등록, 이미지는 `public/blog/dimigo-challenge-*`, `public/blog/dimigo-project-*`. 본문 마크다운 링크 스타일(`.md-preview a`) 추가.
- **SEO 개선 (봇 프리렌더 + 동적 sitemap)**: SPA 라서 JS 미실행 크롤러(AI 크롤러·네이버 Yeti·카카오 스크래퍼)에 본문이 안 보이던 문제 해결. 상세는 [OPERATIONS.md](OPERATIONS.md#seo--봇-프리렌더) 참고.
  - `api/prerender.js`: 봇 user-agent 전용 완전한 HTML(제목·본문·글별 OG·JSON-LD) 응답. 일반 방문자는 SPA 그대로. 발행 글 등 공개 데이터만 조회.
  - `api/sitemap.js`: 발행 블로그 글 포함 동적 sitemap (`/sitemap.xml` rewrite, 정적 파일 제거)
  - `index.html` 학원 JSON-LD, `analytics.ts` 라우트별 canonical/OG 동기화, `robots.txt`에 `/admin` 차단, `llms.txt` 추가

---

## 최근 변경 (2026-07-21)

- **유입경로(UTM) 추적 추가**: 광고 랜딩 URL의 `utm_*` 파라미터·외부 리퍼러를 첫 방문 시 캡처(`src/lib/attribution.ts`, sessionStorage first-touch)해 상담 예약(`consultations.attribution`)과 수강신청·범용 폼 제출(`submissions.attribution`)에 저장. 목적: 광고 채널 ↔ 문의 건 단위 연결(상담로그 유입경로 세분화).
  - Discord 알림에 "유입경로" 필드 추가 (상담 예약·수강신청·범용 제출 모두)
  - GA4 전환 이벤트 `generate_lead` 전송 (`analytics.ts` `trackLead` — consult/enrollment/application 구분)
  - 관리자 상담 예약 목록에 유입 한 줄 표시 (`AdminConsultations`)
  - 필드 구조는 [DATA-MODEL.md](DATA-MODEL.md) 참고. 광고 URL에 UTM을 안 붙이면 필드가 남지 않으므로 채널별 랜딩 URL에 UTM 부착 필요

---

## 미완료 / 이어서 할 작업

- [ ] **Firestore 보안 규칙 강화**: 현재 전체 공개(`allow read, write: if true`) — 신청·상담 개인정보가 외부에서 읽기/쓰기 가능. 관리자 인증(Firebase Auth) 도입과 함께 컬렉션별 규칙 필요
- [ ] **폼 활성화 자동 비활성화**: 한 폼 활성화 시 나머지 자동 비활성화 미구현
- [ ] **이미지 업로드 UI**: 현재 로컬 `public/` 폴더 + 경로 입력 방식. 관리자 UI 업로드 기능 미구현
- [ ] **Firestore 구 배너 정리**: 이미지 전용 전환 전 등록된 구 배너(image 필드 없음) 삭제 필요

---

## 참고

- 디자인 가이드: `docs/design/DESIGN.md`
- 파일 지도: `docs/PROJECT_MAP.md`
- 페이지 스펙: `docs/specs/`
- GitHub: `https://github.com/archers7727/incodingplushome`
- 배포 URL: TBD (선생님 Vercel 연결 후 업데이트)
- Firebase 설정: `src/firebase/config.ts`
- Firestore 폼 재생성 스크립트: `scripts/resetEnrollmentForm.mjs`
