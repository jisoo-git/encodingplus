# 블로그 스펙

## 기본 정보
- **페이지 제목**: "입시 블로그" ("디미고 입시 블로그" 금지)
- **부제**: "디미고·특성화고 입시 정보와 합격 노하우"
- **카테고리 없음** — 글마다 메인 해시태그 1개 (`tag` 필드)

## 목록 (Blog.tsx)
- 핀 고정 글: 최상단 별도 섹션 (최대 3개)
- `published !== false` 글만 표시 (기존 글 하위 호환)
- 카드: 대표 이미지(150px) + `#태그` + 제목 + 요약 + 날짜
- 카드 그리드: `gridAutoRows: '1fr'` + 카드에 `height: 100%` 필수 (행 높이 통일)

## 상세 (BlogPost.tsx)
- 대표 이미지: 210px, border-radius 14px
- 해시태그 pill: border-radius 999px, background `#dbeafe`
- 본문: react-markdown으로 렌더링 (`content`는 마크다운 string)
- 진입 시 Firestore `views` increment
- **하단 CTA**: 밝은 카드 스타일 ("우리 아이 입시가 고민되시나요?") — 다크 스타일 사용 금지

## Firestore 필드
`{ tag, title, excerpt, coverImage, content: string, date, read, pinned?, published?, views? }`

## 관리자 (AdminBlogList / AdminBlogWrite)
- 목록: 3열 그리드 카드, 핀 토글(이미지 우상단), 발행/비공개 토글(카드 하단)
- 작성: 마크다운 에디터(작성/미리보기 탭), 초안(`published: false`) / 발행 관리
