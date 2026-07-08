# 연동 영향범위 (Blast Radius)

사용자 페이지와 관리자 페이지가 **같은 Firestore 데이터를 공유**한다. 한쪽을 수정하면 반드시 다른 쪽 영향 여부를 확인할 것.

| 기능 | 사용자 | 관리자 | 연동 포인트 |
|------|--------|--------|------------|
| 배너 | `Home.tsx` | `AdminBanners.tsx` | `banners` 컬렉션, `link` 필드 라우팅 |
| 신청 폼 | `Apply.tsx` | `AdminFormList.tsx` / `FormBuilder.tsx` | `forms` 컬렉션, `type`·`isActive` |
| 신청 현황 | `Apply.tsx` (제출 구조) | `AdminSubmissions.tsx` | `submissions` 필드 구조. **+ `consultations`(예약분)를 읽어 통합 인박스로 함께 표시** — `ConsultDoc`의 `name/phone/status/date/hour` 의존 |
| 상담 예약 | `Consult.tsx` | `AdminConsultations.tsx`(슬롯 관리) · `AdminSubmissions.tsx`(통합 인박스 읽기·상태변경) | `consultations`(슬롯=문서 ID)·`settings/consultation`(스케줄). 슬롯 키 형식·`kind`·`status`·`weekly` 구조를 공유. 상태변경은 출처(source)별로 올바른 컬렉션에 기록 |
| 블로그 | `Blog.tsx` / `BlogPost.tsx` | `AdminBlogList.tsx` / `AdminBlogWrite.tsx` | `blogPosts` 컬렉션, `published`·`pinned` |

- 컬렉션 필드 구조를 바꾸면 → 읽는 쪽·쓰는 쪽 **둘 다** 확인. 필드 구조는 [DATA-MODEL.md](DATA-MODEL.md).
- 신청 폼 렌더 방식은 [specs/APPLY_SPEC.md](specs/APPLY_SPEC.md) 참조.

## Resolved routing dependency: seminar application

- `/start` owns the choice between consultation booking, enrollment, and seminar application.
- Enrollment uses `/apply` and the active enrollment Form.
- Seminar application uses canonical `/apply?formId={formId}` and opens one specific Form. `/apply?type=seminar` is an alias that resolves through `settings/apply.seminarFormId` first, then falls back to the legacy `forms.type = seminar` Form for backward compatibility. New seminar routing should not create new `forms.type = seminar` records.
- Changing the seminar Form id affects `ApplyHub.tsx` and any public link that points to that seminar application.
- Changing the Form schema affects `Apply.tsx` submission rendering and `AdminSubmissions.tsx` detail display.

## Resolved active Form dependency

- `/apply` depends on the active enrollment Form singleton.
- `AdminFormList.tsx` and `useForms.ts` must preserve the invariant that only one enrollment Form is active.
- `/apply?formId={formId}` bypasses the active singleton and loads that specific Form for seminar-style public applications.
- Changes to `isActive` behavior affect `/apply`; changes to a seminar Form id affect `/start` and any external seminar links.

## Resolved banner click dependency

- Home banner clicks currently route to `/start` by default. The seminar image is not injected into the slider; it is shown as a home-entry popup and routes to `/apply?type=seminar`.
- `banners.link` is retained in the admin data shape, but arbitrary stored links are not the current public click contract for `Home.tsx`.
- Changing banner navigation away from `/start` affects `Home.tsx`, `AdminBanners.tsx`, and any operating instructions that tell admins what the link field means.

## Paused quiz subsystem dependency

- `responses` is not part of the active enrollment, seminar application, consultation, banner, or blog flows.
- `FormPage.tsx`, `Dashboard.tsx`, and `Responses.tsx` are retained but not routed.
- Reviving quiz affects `App.tsx`, `src/types/index.ts`, `FormBuilder.tsx`, `FormPage.tsx`, `Responses.tsx`, and the `responses` collection.
