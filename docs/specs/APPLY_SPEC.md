# Apply rendering spec

`Apply.tsx` renders public application Forms. Domain language is defined in [CONTEXT.md](../../CONTEXT.md), and Firestore shape is defined in [DATA-MODEL.md](../DATA-MODEL.md).

## Routing rules

- `/start` is the public hub for consultation booking, enrollment, and seminar application.
- `/apply` without `formId` loads the active enrollment Form and renders the enrollment 3-step flow.
- `/apply?formId={formId}` loads that exact Form document.
- `/apply?type=seminar` is supported as a compatibility/banner alias. The page resolves `settings/apply.seminarFormId` first; if it is empty, it falls back to the legacy `forms.type = seminar` Form and replaces the URL with `/apply?formId={formId}` internally.
- `forms.type` is `enrollment | generic | quiz`; do not add `seminar`.
- `quiz` is paused and must not drive public routing.

## Render mode decision

| Condition | Render mode |
| --- | --- |
| No `formId`, active enrollment Form found | Enrollment 3-step flow |
| No `formId`, no active enrollment Form | Enrollment preparation/empty state |
| `formId` points to an enrollment Form | Enrollment 3-step flow |
| `formId` points to a non-enrollment, non-quiz Form | Generic section-by-section flow |
| `formId` points to a quiz Form | Treat as unavailable while quiz is paused |

## Enrollment 3-step rules

- Step 1: hardcoded privacy agreement + course choice + info questions from the `신청 확인` section.
- Step 2: info questions from the `주의사항` section + confirmation checkbox.
- Step 3: questions from the section whose title exactly matches the selected course.
- Course section titles must exactly match the course choices used by `Apply.tsx`.

## Submission rules

- Enrollment and seminar-style applications write to `submissions`.
- Seminar-style applications do not write to `responses` and do not use a separate seminar collection.
- Generic Forms save a normal `Submission` with `formId`, `formTitle`, optional extracted contact fields, and `detail`.

## Active Form rule

- `isActive` is only the public singleton selector for enrollment Forms.
- At most one `enrollment` Form should be active at a time.
- Seminar application Forms are opened canonically by `/apply?formId={formId}`. `/apply?type=seminar` may be used as a public compatibility alias that resolves through `settings/apply.seminarFormId`, with fallback to the legacy `forms.type = seminar` Form.
- `quiz` Forms are reserved/paused and are excluded from the public active Form rule.

## Seminar apply feature flag

- `SEMINAR_APPLY_ENABLED` (`src/forms/routes.ts`) is a hard on/off switch for seminar application. When `false`: `resolveSeminarApplyPath()` returns `null` without touching Firestore; the Home popup and "설명회" section, the `/start` hub card, are all hidden; `?type=seminar` and any direct `?formId=` link that resolves to the configured/legacy seminar Form show a "설명회 신청이 마감되었습니다" notice instead of the form (via `isSeminarFormId()` in `Apply.tsx`).
- To re-enable, flip `SEMINAR_APPLY_ENABLED` back to `true` in `src/forms/routes.ts` — no other code changes needed.

## Coupling

- Form editing lives in `FormBuilder.tsx` and `AdminFormList.tsx`.
- Public rendering lives in `Apply.tsx`.
- Submission review lives in `AdminSubmissions.tsx`.
- Routing and schema changes must be checked against [DEPENDENCY-MAP.md](../DEPENDENCY-MAP.md).
