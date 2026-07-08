const MAX_FIELD_VALUE_LENGTH = 1024
const MAX_DESCRIPTION_LENGTH = 1800

const DEFAULT_TITLE = '\uC0C8 \uC2E0\uCCAD'
const BOT_NAME = '\uC778\uCF54\uB529\uD50C\uB7EC\uC2A4 \uC2E0\uCCAD \uC54C\uB9BC'

function asText(value, fallback = '-') {
  if (value === undefined || value === null) return fallback
  const text = String(value).trim()
  return text || fallback
}

function truncate(value, maxLength) {
  const text = asText(value)
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text
}

function normalizeFields(fields) {
  if (!Array.isArray(fields)) return []

  return fields
    .filter(field => field && field.name)
    .slice(0, 20)
    .map(field => ({
      name: truncate(field.name, 256),
      value: truncate(field.value, MAX_FIELD_VALUE_LENGTH),
      inline: Boolean(field.inline),
    }))
}

function colorForKind(kind) {
  if (kind === 'consultation') return 0x22c55e
  if (kind === 'enrollment') return 0x2563eb
  return 0xf59e0b
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    return res.status(503).json({ error: 'Discord webhook is not configured' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const fields = normalizeFields(body?.fields)
    const embed = {
      title: truncate(body?.title ?? DEFAULT_TITLE, 256),
      description: truncate(body?.description ?? '', MAX_DESCRIPTION_LENGTH),
      color: colorForKind(body?.kind),
      fields,
      timestamp: new Date().toISOString(),
    }

    const discordRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: BOT_NAME,
        allowed_mentions: { parse: [] },
        embeds: [embed],
      }),
    })

    if (!discordRes.ok) {
      const message = await discordRes.text()
      return res.status(502).json({ error: 'Discord webhook failed', message })
    }

    return res.status(204).end()
  } catch (error) {
    return res.status(400).json({
      error: 'Invalid notification payload',
      message: error instanceof Error ? error.message : String(error),
    })
  }
}