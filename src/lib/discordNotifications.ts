type NotificationKind = 'enrollment' | 'application' | 'consultation'

interface NotificationField {
  name: string
  value: string
  inline?: boolean
}

interface SubmissionNotificationInput {
  kind: NotificationKind
  title: string
  name?: string
  phone?: string
  school?: string
  grade?: string
  course?: string
  date?: string
  hour?: number
  formTitle?: string
  detail?: Record<string, unknown>
}

const LABELS = {
  name: '\uC774\uB984',
  phone: '\uC5F0\uB77D\uCC98',
  school: '\uD559\uAD50',
  grade: '\uD559\uB144',
  course: '\uC218\uC5C5',
  date: '\uC608\uC57D\uC77C',
  hour: '\uC608\uC57D\uC2DC\uAC04',
  form: '\uD3FC',
}

const MESSAGES = {
  application: '\uC0C8 \uC2E0\uCCAD\uC774 \uC811\uC218\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
  consultation: '\uC0C8 \uC0C1\uB2F4 \uC608\uC57D\uC774 \uC811\uC218\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
}

function clean(value: unknown) {
  if (value === undefined || value === null) return ''
  return String(value).trim()
}

function addField(fields: NotificationField[], name: string, value: unknown, inline = true) {
  const text = clean(value)
  if (text) fields.push({ name, value: text, inline })
}

function detailFields(detail: Record<string, unknown> | undefined) {
  if (!detail) return []

  return Object.entries(detail)
    .filter(([, value]) => clean(value))
    .slice(0, 10)
    .map(([name, value]) => ({ name, value: clean(value), inline: false }))
}

export async function notifySubmissionCreated(input: SubmissionNotificationInput) {
  const fields: NotificationField[] = []

  addField(fields, LABELS.name, input.name)
  addField(fields, LABELS.phone, input.phone)
  addField(fields, LABELS.school, input.school)
  addField(fields, LABELS.grade, input.grade)
  addField(fields, LABELS.course, input.course, false)
  addField(fields, LABELS.date, input.date)
  addField(fields, LABELS.hour, input.hour !== undefined ? `${input.hour}:00` : undefined)
  addField(fields, LABELS.form, input.formTitle, false)

  const description = input.kind === 'consultation' ? MESSAGES.consultation : MESSAGES.application

  try {
    await fetch('/api/discord-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: input.kind,
        title: input.title,
        description,
        fields: [...fields, ...detailFields(input.detail)],
      }),
    })
  } catch (error) {
    console.warn('Discord notification failed', error)
  }
}