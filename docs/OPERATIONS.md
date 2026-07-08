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

## Environment variables

- `VITE_ADMIN_PASSWORD`: admin login password.

## Apply settings

- `settings/apply.seminarFormId`: Firestore Form document id opened from `/start`, the home seminar popup/CTA, and the `/apply?type=seminar` compatibility alias, including fallback to the legacy `forms.type = seminar` Form.
- Leave `seminarFormId` empty only when seminar application is intentionally unavailable.
