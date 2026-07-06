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
