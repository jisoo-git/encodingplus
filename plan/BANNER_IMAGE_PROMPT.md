# 인코딩플러스 배너 이미지 제작 가이드 (ChatGPT / DALL-E 3)

> 배너 슬라이더는 **이미지 전용**입니다.
> ChatGPT(DALL-E 3)로 텍스트·디자인이 모두 포함된 완성 배너를 생성합니다.

---

## 이미지 규격

| 항목 | 값 |
|------|-----|
| **비율** | 16:9 (근사) |
| **생성 크기** | **1792 × 1024** (ChatGPT 와이드 포맷) |
| **포맷** | PNG |
| **파일명** | 영문, 공백 없이 (예: `banner_dimigo_2027.png`) |

ChatGPT에 요청 시 반드시 명시:
```
Generate in wide landscape format, 1792x1024
```

---

## 브랜드 색상 (프롬프트에 직접 명시)

| 용도 | 색상 코드 | 프롬프트 표현 |
|------|-----------|--------------|
| 배경 기본 | `#001233` → `#002B5C` | `dark navy blue gradient background` |
| 배경 대안 | `#18181b` → `#374151` | `very dark charcoal background` |
| 주요 텍스트 | `#FFFFFF` | `white text` |
| 강조 텍스트 | `#93C5FD` | `light sky blue accent text` |
| 포인트 | `#2563EB` | `electric blue #2563EB` |

**금지**: 빨강·주황·초록·보라 계열

---

## 한국어 텍스트 팁

DALL-E 3는 한국어를 넣을 수 있지만 **간혹 글자가 틀립니다**.
- 짧고 명확한 단어일수록 정확도 높음
- 틀리면 ChatGPT에 "한국어 텍스트만 수정해서 다시 생성해줘" 요청
- 텍스트가 중요한 배너는 2~3회 재생성해서 가장 정확한 것 선택

---

## 완성 배너 프롬프트 (복붙 사용)

### 배너 1 — 디미고 입시 특강

```
Create a professional Korean educational academy banner image.

Layout: wide landscape 1792x1024, dark navy blue background (#001233 to #002B5C gradient at 135 degrees)

Left side text (white, Korean):
- Top small label: "디미고 합격률 1위" (small, light blue)
- Large main title: "디미고 입시 특강" (very large, white, bold)
- Subtitle banner strip: "입시 단기특강 · 일반전형 특강" (medium, on a semi-transparent dark blue ribbon)
- Bottom line with checkmark icon: "특전과 일전을 모두 도전하여 합격률 상승" (white and light blue)

Right side: 3D graduation cap on stacked navy blue books with open notebook and pen, blue glow lighting

Top left: dramatic blue light ray burst effect

Style: professional Korean advertising banner, cinematic dark blue tones, high quality 3D render elements
Generate in wide landscape format, 1792x1024
```

---

### 배너 2 — 합격 실적

```
Create a professional Korean educational academy banner image.

Layout: wide landscape 1792x1024, very dark navy background (#001233 to #003580 gradient)

Left side text (white, Korean):
- Top small label: "2026 디미고 입시 결과" (small, light blue, bold)
- Large main title: "디미고 37명 합격" (very large, white, extra bold)
- Subtitle: "2025년 35명 · 2024년 37명 · 2023년 35명" (medium, rgba white 80%)
- Bottom accent: "9년 누적 212명 합격" (light blue glow text)

Right side: 3D golden trophy with blue sparkles and star burst effect, confetti in blue and white tones

Style: professional Korean advertising banner, achievement and celebration mood, dark navy tones, high quality
Generate in wide landscape format, 1792x1024
```

---

### 배너 3 — 전형 안내

```
Create a professional Korean educational academy banner image.

Layout: wide landscape 1792x1024, dark navy to medium blue background (#0f4c75 to #1b6ca8 gradient)

Left side text (white, Korean):
- Top small label: "특성화고 전 전형 대비" (small, light blue)
- Large main title: "선린고 · 단소고" (large, white, bold)
- Second title line: "다수 합격" (same large size, light blue accent)
- Subtitle: "특별전형부터 일반전형까지 완벽 대비합니다" (medium, white 80%)

Right side: Multiple school buildings silhouette with blue sky and light beams, academic symbols floating

Style: professional Korean educational banner, trustworthy academic tone, blue tones
Generate in wide landscape format, 1792x1024
```

---

### 배너 4 — 상담 문의

```
Create a professional Korean educational academy banner image.

Layout: wide landscape 1792x1024, very dark charcoal background (#18181b to #374151 gradient)

Left side text (white, Korean):
- Top small label: "입시 상담 문의" (small, light blue)
- Large main title: "010-2838-2391" (very large, white, monospace bold style)
- Subtitle: "지금 바로 1:1 입시 상담을 신청하세요" (medium, white 70%)
- Bottom: "카카오 채널 상담 가능" (yellow #FEE500 accent text with small kakao icon)

Right side: 3D smartphone with glowing screen showing chat bubbles, blue ambient lighting

Style: professional Korean advertising banner, clean minimal dark tone, call to action mood
Generate in wide landscape format, 1792x1024
```

---

### 배너 5 — 설명회 안내 (자유 커스텀용)

```
Create a professional Korean educational academy banner image.

Layout: wide landscape 1792x1024, dark navy blue background (#1e3a5f to #2563eb gradient)

Left side text (white, Korean):
- Top small label: [원하는 라벨 텍스트 입력]
- Large main title: [원하는 메인 타이틀 입력]
- Subtitle: [원하는 부제목 입력]

Right side: 3D calendar icon with blue glow, clock showing time, floating particles

Style: professional Korean educational academy advertising banner, event announcement mood, electric blue tones, high quality
Generate in wide landscape format, 1792x1024
```

---

## ChatGPT 요청 방법

1. ChatGPT → 대화창에 위 프롬프트 붙여넣기
2. 이미지 생성 후 한국어 텍스트 확인
3. 틀린 글자 있으면: `"한국어 텍스트 '[틀린 글자]'를 '[올바른 글자]'로 수정해서 다시 만들어줘"`
4. 만족스러우면 이미지 다운로드 (우클릭 → 이미지 저장)

---

## 등록 방법

```
1. 다운로드한 이미지 → public/banners/ 폴더에 저장
   예: public/banners/banner_dimigo_2027.png

2. Firebase 관리자 → 홍보배너 → 배너 수정
   이미지 URL 입력: /banners/banner_dimigo_2027.png

3. 배너 제목·내용은 이미지에 포함되어 있으므로
   Firebase 텍스트 필드는 관리용으로만 입력
```

---

## 배너 색상 프리셋 (배경 선택 참고)

| 이름 | 왼쪽 | 오른쪽 | 프롬프트 표현 |
|------|------|--------|--------------|
| 진파랑 | `#002B5C` | `#2563EB` | `dark navy to electric blue` |
| 네이비 | `#001233` | `#003580` | `very dark navy to deep blue` |
| 미드블루 | `#0F4C75` | `#1B6CA8` | `ocean blue gradient` |
| 딥블루 | `#1E3A5F` | `#2563EB` | `deep navy to bright blue` |
| 다크 | `#18181B` | `#374151` | `very dark charcoal to dark gray` |
