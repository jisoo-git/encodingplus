# 인코딩플러스 작업 현황 (2026-06-27)

---

## 현재 구현 상태

### 사용자 페이지
- **홈**: 배너 슬라이더(Firestore/fallback), Stats, WHY, 입시특강 2종 프리뷰, 설명회 섹션, CTA
- **수업소개**: CourseFullCard 전면 표시 (바텀시트 제거)
- **수강신청**: enrollment 3-step 하드코딩 / 범용 폼 섹션별 step, branching(`__end__` 차단·섹션 점프), 제출 저장
- **블로그**: 핀 고정글 상단 분리, 카드 그리드, 마크다운 상세, 조회수 카운트

### 관리자 페이지
- **신청현황**: 상태 관리(새신청/확인완료/상담완료), 폼별 필터 pill, 상태 탭 건수, 상세 시트(전화번호·응답 그리드)
- **폼편집**: FormBuilder CRUD, DnD 순서, 질문 타입 12종
- **홍보배너**: CRUD, 순서 변경, 그라데이션 프리셋 8개 / 이미지 배경, 링크 직접입력
- **블로그**: 3열 그리드 카드, 마크다운 에디터(작성/미리보기), 초안/발행, 핀 토글

### 인프라
- Firestore 컬렉션: `banners` / `blogPosts` / `submissions` / `forms` 운영 중
- Firestore 보안 규칙: `/{document=**}` 전체 허용 (개발 단계)
- 배포: Vercel, main 브랜치 push → 자동 배포
- 이미지: `public/` 폴더 로컬 저장 + Firestore 절대경로 입력 방식

---

## 미완료 / 이어서 할 작업

- [ ] **폼 활성화 자동 비활성화**: 한 폼 활성화 시 나머지 자동 비활성화 미구현
- [ ] **이미지 업로드 UI**: 현재 로컬 `public/` 폴더 + 경로 입력 방식. 관리자 UI 업로드 기능 미구현

---

## 참고

- 디자인 가이드: `plan/DESIGN.md`
- 파일 지도: `plan/PROJECT_MAP.md`
- 페이지 스펙: `plan/specs/`
- GitHub: `https://github.com/jisoo-git/encodingplus`
- 배포 URL: `https://encodingplus.vercel.app/`
- Firebase 설정: `src/firebase/config.ts`
- Firestore 폼 재생성 스크립트: `scripts/resetEnrollmentForm.mjs`
