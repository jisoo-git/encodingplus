# 인코딩플러스 (Incoding Plus)

디미고·특성화고 입시 전문 학원의 홍보 + 수강신청 웹앱. 학부모·학생에게 학원을 소개하고(홈·수업·블로그), 온라인으로 신청을 받는다(수강신청·설명회). 관리자가 배너·폼·신청현황·블로그를 운영한다.

> 이 파일은 **용어 사전(glossary)** 이다. 색상·필드·레이아웃 같은 스펙은 여기에 넣지 않는다 — 그건 `docs/design/`·`docs/specs/`에 있다.

## Language

### 공개 사이트

**배너 (Banner)**:
홈 상단 슬라이더에 노출되는 홍보 이미지 카드. `banners` 컬렉션, `order`로 정렬.
_Avoid_: 슬라이드(슬라이드는 배너를 넘기는 동작을 가리킴).

**과정 (Course)**:
학원이 판매하는 정규 수업 상품(현재 "입시 단기특강", "일반전형 특강" 2종). `docs/specs/COURSES_SPEC.md`가 단일 출처.
_Avoid_: 강의, 클래스, 강좌.

**블로그 글 (Blog Post)**:
입시 정보·합격 노하우를 담은 글. `blogPosts` 컬렉션. `published`로 공개 여부, `pinned`으로 상단 고정.
_Avoid_: 게시물, 아티클, 포스트.

### 신청

**폼 (Form)**:
관리자가 만드는 신청 양식의 정의. `forms` 컬렉션, `type`과 `isActive`를 가지며 여러 **Section**으로 구성된다.
_Avoid_: 설문, 양식지.

**섹션 (Section)** / **질문 (Question)**:
**Form**을 이루는 단위. Section은 질문 묶음이고, Question은 개별 입력 항목(단답·장문·라디오·정보문 등).

**수강신청 (Enrollment)**:
`type: 'enrollment'` 인 **Form**. Apply.tsx가 개인정보 동의 → 수업 선택 → 확인의 3-step으로 특별 렌더한다. 학원의 핵심 신청 흐름.

**설명회 신청 (Seminar Application)**:
학원 입시 설명회 참석 신청. 별도로 만든 **활성 Form**(수강신청과 다른 폼)으로 받으며, 제출은 일반 **Submission**으로 `submissions`에 쌓인다. 수강신청과는 별개 흐름이지만 저장소는 같다.
_Avoid_: 설명회 등록, 세미나.

**제출 (Submission)**:
사용자가 공개된 **Form**을 제출해 남긴 신청 기록. `submissions` 컬렉션, `status`로 처리 상태(new 등)를 추적. 관리자 AdminSubmissions에서 확인.
_Avoid_: 응답(→ "Flagged ambiguities" 참조), 접수.

**상담 예약 (Consultation)**:
학부모·학생이 날짜·시간을 골라 1:1 상담을 예약하는 별도 흐름. **Form 시스템을 쓰지 않고** `consultations` 컬렉션에 **슬롯 문서**(문서 ID=`날짜_시`)로 쌓인다. 1시간 단위, **슬롯당 1팀**. 예약(`kind:'booking'`)·관리자 차단(`kind:'block'`)이 같은 슬롯을 점유하며, 취소·해제는 문서 삭제. 가용 시간은 `settings/consultation` 설정 문서로 관리자가 정한다.
_Avoid_: 예약 신청(→ 그냥 "상담 예약"), 상담 신청(수강/설명회 **신청**과 혼동), 슬롯 접수.

### 관리자

**관리자 (Admin)**:
`/admin/*` 경로. 비밀번호 인증 후 배너·폼·신청현황·블로그를 운영하는 주체이자 영역.

### 보류 (아직 안 씀)

> quiz 서브시스템은 **미완성·보류** 상태다. 아래 용어는 정의만 남기고, 현역 어휘로 취급하지 않는다. 코드상 `FormPage.tsx`·`Responses.tsx`·`Dashboard.tsx`는 `App.tsx` 라우트에 연결돼 있지 않다.

**응답 (Response)**:
채점형 **quiz** Form의 제출 기록. `responses` 컬렉션(현역 **Submission**과 별개). 보류 상태라 현재 쌓이지 않는다.

**퀴즈 (Quiz)**:
`type: 'quiz'` 인 채점형 Form. 정답·배점을 갖는다. 보류.

## Relationships

- 하나의 **Form**은 여러 **Section**을, 각 **Section**은 여러 **Question**을 가진다.
- 공개된(**isActive**) **Form**을 제출하면 **Submission** 1건이 `submissions`에 쌓인다.
- **Enrollment**은 특정 **Course**를 선택하게 하는 **Form**의 한 종류다.
- **Blog Post**·**Banner**·**Course**는 서로 독립적이며, 홈에서 나란히 노출된다.

## Example dialogue

> **개발:** 사용자가 **수강신청(Enrollment)** 을 마치면 어디에 저장돼요?
> **운영:** `submissions`에 **제출(Submission)** 로 한 건 들어가요. 관리자 신청현황에서 그걸 봅니다.
> **개발:** 그럼 `responses`에 쌓이는 건 뭐죠?
> **운영:** 그건 quiz 서브시스템 쪽인데 지금은 보류라 안 씁니다. 설명회 신청도 결국 `submissions`에 **제출**로 쌓여요.

## Resolved ambiguities

초기 작성 시 코드와 문서가 어긋나 flag했던 항목들. 운영자 확인으로 해소됨.

1. **폼 type 값** — 실제 값은 `FormType = 'enrollment' | 'quiz'`. CLAUDE.md·Apply 주석의 `seminar`는 잔재이며 별도 type이 아니다. **설명회 신청**은 별도 활성 Form으로 구현(아래 4번).
2. **제출 vs 응답** — **제출(Submission)** = 현역, `submissions`. **응답(Response)** = quiz 전용, `responses`, **보류**. 둘은 별개 컬렉션.
3. **라우트에 없는 페이지** — `FormPage.tsx`·`Responses.tsx`·`Dashboard.tsx`는 quiz 서브시스템으로 **미완성·보류**. 현역 어휘에서 제외(→ "보류" 섹션).
4. **설명회 신청** — 별도 **활성 Form**으로 받고 제출은 `submissions`에 **Submission**으로 쌓인다. 별도 form type이 아니다.
