# 운영 · 배포

프로젝트 실행·배포·자산 관리에 필요한 운영 정보. (용어는 [CONTEXT.md](../CONTEXT.md), 구조는 [PROJECT_MAP.md](PROJECT_MAP.md) 참조)

## 기술 스택

- **React 18 + TypeScript + Vite**
- **Tailwind v4** (커스텀 breakpoint: `md:` = 900px, 기본 768px 아님)
- **Firebase Firestore** (DB), Firebase Auth (관리자)
- **폰트**: Pretendard (400/500/600/700/800)
- **라우터**: React Router v6

## 배포

- **호스팅**: Vercel — GitHub `main` 브랜치 push → 자동 배포 (별도 명령어 불필요)
- **Firestore Rules 변경 시에만**: `firebase deploy --only firestore:rules`
- **GitHub**: `https://github.com/archers7727/incodingplushome`
- **배포 URL**: `https://home.in-coding.com/` (index.html canonical 기준)
- **GitHub 인증**: Windows Git Credential Manager에 토큰 저장됨 → `git push`로 바로 푸시 가능

## 이미지 관리 규칙

이미지는 `public/` 폴더에 저장 → Firestore에 절대 경로 입력. Vite가 루트로 서빙.

| 용도 | 폴더 | 입력값 예시 |
|------|------|------------|
| 배너 배경 | `public/banners/` | `/banners/banner1.png` |
| 블로그 대표 이미지 | `public/blog/` | `/blog/이미지명.jpg` |
| 다운로드 파일 | `public/files/` | `/files/파일명.xlsx` |

외부 URL(네이버 등) 핫링크 차단으로 사용 불가. 파일명 공백 제거 필수.

## SEO · 봇 프리렌더

SPA 특성상 JS 를 실행하지 않는 크롤러(AI 크롤러·네이버 Yeti·카카오/페북 링크 스크래퍼)는 빈 페이지를 보므로, 봇에게만 서버에서 완전한 HTML 을 응답한다. 일반 방문자는 기존 SPA 그대로.

- **`api/prerender.js`**: `vercel.json` 의 user-agent 조건부 rewrite 로 봇 요청만 진입. 홈·수업·블로그 목록/글·상담/신청 경로를 제목·설명·canonical·글별 OG·JSON-LD 포함 HTML 로 응답. 발행된 블로그 글 등 **공개 데이터만** Firestore REST 로 조회하고, 마크다운의 원시 HTML 은 이스케이프된다(markdown-it html:false). CDN 캐시 10분.
- **`api/sitemap.js`**: `/sitemap.xml` rewrite. 정적 경로 + 발행(`published !== false`) 블로그 글을 합쳐 생성 — 새 글 발행 시 자동 반영 (정적 `public/sitemap.xml` 은 제거됨).
- **봇 UA 목록** (`vercel.json`): 사람이 쓰는 인앱 브라우저를 오인하지 않도록 정확한 토큰만 매칭한다 — 카카오톡 인앱(`KAKAOTALK`)이 아니라 스크래퍼(`kakaotalk-scrap`), 네이버 앱(`NAVER`)이 아니라 검색봇(`yeti`). 새 봇 추가 시 이 원칙 유지.
- **라우트별 메타**: JS 를 실행하는 크롤러(구글)용으로 `src/lib/analytics.ts` 가 라우트 변경 시 title·canonical·og:url/title 을 갱신한다.
- 기타: `public/robots.txt`(`/admin` 차단), `public/llms.txt`(AI 크롤러용 사이트 요약 — 주요 페이지·연락처 변경 시 함께 갱신).

## Environment variables

- `VITE_ADMIN_PASSWORD`: admin login password.

## Apply settings

- `settings/apply.seminarFormId`: Firestore Form document id opened from `/start`, the home seminar popup/CTA, and the `/apply?type=seminar` compatibility alias, including fallback to the legacy `forms.type = seminar` Form.
- Leave `seminarFormId` empty only when seminar application is intentionally unavailable.
