import 'server-only'
import { sendConsultationEmail } from '../api/resendClient'
import {
  claimEmails,
  markEmailFailed,
  markEmailSent,
  queueReminders,
} from '../repositories/emailRepository'

export async function deliverEmails(includeReminders = false) {
  if (includeReminders) await queueReminders()
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return { claimed: 0, sent: 0 }
  const emails = await claimEmails()
  let sent = 0
  for (const email of emails) {
    try {
      await sendConsultationEmail({
        id: email.id,
        recipient: email.recipient_email,
        event: email.event_type,
        date: email.consultation_date,
        start: email.start_time,
        end: email.end_time,
      })
      await markEmailSent(email.id)
      sent++
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown'
      console.error('Email delivery failed', { id: email.id, reason })
      await markEmailFailed(email.id, reason).catch(() => {
        console.error('Email failure could not be recorded', { id: email.id })
      })
    }
  }
  return { claimed: emails.length, sent }
}
