# 인코딩플러스 작업 현황 (2026-06-27)

---

## 완료된 작업

### 핵심 버그 수정
- [x] Firestore 보안 규칙: `/{document=**}` 전체 허용으로 수정 (`firestore.rules`)
- [x] 초안 저장 버그: `date: undefined` → 조건부 spread로 수정
- [x] AdminBlogList 문법 오류: map 블록 닫는 괄호 누락
- [x] AdminBanners 타입 오류: `typeof sheet === 'object'` 타입 가드

### 디자인 / 색상
- [x] 보라/인디고 계열 전부 → 파란색 계열로 교체
- [x] 테두리 색 강화: `#c8d0dc` 통일
- [x] body 배경 `#eff6ff` (blue-50) 통일
- [x] CTA 버튼 색상: `#0099D6` → `#2563eb` 통일

### 레이아웃
- [x] AdminLayout ↔ UserLayout 너비 구조 통일 (1200px 외부 + 1100px 내부)
- [x] 관리자 로고: `인코딩플러스.` + `관리자` 뱃지
- [x] AdminSubmissions: 목록 섹션 화면 높이 꽉 채움 (flex: 1)

### 섹션 제목 패턴
- [x] 파란 바(3px) + 영문 라벨 + 한글 제목 → AdminSubmissions, AdminFormList, AdminBanners, AdminBlogList
- [x] FormBuilder, AdminBlogWrite는 파란 바 없음

### FormBuilder
- [x] 파란 바 제거, 취소 버튼 추가
- [x] overflow: hidden 제거 → 질문 추가 드롭다운 잘림 해결

### AdminBlogWrite
- [x] 블록 에디터 → **마크다운 에디터** (preview 탭 전환)
- [x] Sticky 헤더 흰색 배경
- [x] Firestore 초안 저장 (`published: false`)
- [x] 편집 모드 헤더에 `초안` / `발행됨` 뱃지

### AdminBlogList
- [x] 리스트 → 3열 그리드 카드
- [x] 핀 토글: 이미지 우상단 오버레이 버튼
- [x] 발행/비공개 토글 버튼 (카드 하단)

### Blog.tsx (사용자)
- [x] 핀 고정 글 최상단 별도 섹션 (최대 3개)
- [x] `published !== false` 글만 표시 (기존 글 하위 호환)
- [x] 날짜 ← / 조회수 →
- [x] **카드 그리드 높이 통일**: `gridAutoRows: '1fr'` + 카드 `height: 100%`
- [x] **요약 미잘림**: line-clamp 제거
- [x] **사용자 목록 핀 아이콘 제거** (관리자 전용)

### AdminBanners
- [x] 배경 그라데이션 프리셋 8개
- [x] **배너 이미지 지원**: URL 입력 → 전체 배경 이미지로 렌더링
- [x] 이미지 설정 시 색상 선택 비활성화 (opacity 0.4)
- [x] 미리보기 텍스트/버튼 흰색

### Home.tsx
- [x] 배너 이미지 렌더링: image → backgroundImage, 오버레이 강화
- [x] **배너 CTA 자동 레이블**: `CTA_LABELS[b.link] || b.cta` (기존 Firestore 데이터 자동 수정)
- [x] "개설강좌" → "입시 특강" 명칭 변경
- [x] COURSE 02: "일반전형 특강", 세부항목 순서 변경, "16주" 명시
- [x] WHY 섹션 리디자인: 구조화된 카드 3개 (전학과맞춤/검증된실적/밀착관리)

### Types
- [x] `Post.content: ContentBlock[]` → `content: string` (마크다운)
- [x] `Post`: `pinned?`, `views?`, `published?` 필드 추가
- [x] `banners`: `image?` 필드 추가

### Apply.tsx
- [x] Step1 하드코딩 (개인정보 동의 + 수업 선택), Step2 유의사항, Step3 수업별 섹션
- [x] info 타입 질문 → 공지 카드로 렌더 (배경 #eff6ff, 전체 label 표시)
- [x] 필수 radio '아니오' 선택 시 경고 메시지 + Next 차단
- [x] 유의사항: `sections.find(s.title === '유의사항')` info 질문만 필터 → 없으면 하드코딩 NOTICES 폴백
- [x] Step2 렌더링: label의 첫 `:` 기준으로 제목/내용 분리 (하드코딩 NOTICES와 동일 스타일)
- [x] Step3: `sections.find(s.title === course)` 정확 매칭 → 없으면 "준비 중" 표시
- [x] 제출: 이름/학교/연락처 keyword 추출, course 필드 저장

### enrollmentTemplate.ts
- [x] **4섹션 구조 확립**: 신청 확인 / 유의사항 / 입시 단기특강 / 일반전형 특강
- [x] 섹션 제목 Apply.tsx 매칭 키워드와 정확히 일치 ("입시 단기특강 신청" → "입시 단기특강")
- [x] 유의사항 섹션: info 타입 질문 4개 (수업 개설 기준 / 결석·보충 / 수강료 납부 / 환불 규정)

---

## 미완료 / 이어서 할 작업

### 기능 (우선순위 높음)
- [ ] **수강신청 폼 세팅**: 관리자가 FormBuilder에서 "새로 만들기" → 4섹션 자동 생성 → isActive 활성화 필요 (기존 폼은 제목 불일치로 삭제 후 재생성 권장)
- [ ] **폼 활성화 자동 비활성화**: 한 폼 활성화 시 나머지 자동 비활성화 미구현

### 기능 (우선순위 낮음)
- [ ] **조회수 카운트**: BlogPost 진입 시 `views` 필드 increment 필요
- [ ] **이미지 업로드**: 현재 URL 직접 입력. Firebase Storage 업로드 여부 미결

### 디자인 점검 필요
- [ ] BlogPost 상세 페이지
- [ ] Courses 수업 소개 페이지
- [ ] Apply 수강신청 페이지

---

## 참고
- 디자인 가이드: `plan/DESIGN.md`
- Firebase 설정: `src/firebase/config.ts` (하드코딩)
- Firestore 규칙: `firestore.rules` (전체 허용)
