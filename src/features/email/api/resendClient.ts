import 'server-only'
import { Resend } from 'resend'

export async function sendConsultationEmail(input: {
  id: string
  recipient: string
  event: string
  date: string
  start: string
  end: string
}) {
  const key = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!key || !from) throw new Error('Email delivery is not configured')
  const subject =
    input.event === 'REMINDER'
      ? 'Consultation reminder'
      : `Consultation ${input.event.toLowerCase()}`
  const date = `${input.date}, ${input.start.slice(0, 5)}–${input.end.slice(0, 5)} (Philippine time)`
  const text =
    input.event === 'APPROVED' || input.event === 'REMINDER'
      ? `${subject}. Your consultation is scheduled for ${date}. Sign in to the ACD consultation system for details.`
      : `${subject}. Sign in to the ACD consultation system to check your consultation status.`
  console.info('[resend] request', {
    timestamp: new Date().toISOString(),
    outboxId: input.id,
    subject,
  })
  const { data, error } = await new Resend(key).emails.send(
    { from, to: input.recipient, subject, text },
    { idempotencyKey: input.id }
  )
  if (error) {
    console.error('[resend] response error', {
      timestamp: new Date().toISOString(),
      outboxId: input.id,
      statusCode: error.statusCode,
      code: error.name,
      message: error.message,
    })
    throw new Error(`Email provider rejected delivery: ${error.message}`)
  }
  console.info('[resend] response ok', {
    timestamp: new Date().toISOString(),
    outboxId: input.id,
    resendId: data.id,
  })
}
