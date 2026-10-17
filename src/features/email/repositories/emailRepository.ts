import 'server-only'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Email queue is not configured')
  return createClient(url, key, { auth: { persistSession: false } })
}

type QueuedEmail = {
  id: string
  recipient_email: string
  event_type: string
  consultation_date: string
  start_time: string
  end_time: string
}

export async function queueReminders() {
  const { error } = await adminClient().rpc('queue_tomorrow_reminders')
  if (error) throw new Error('Unable to queue reminders')
}

export async function claimEmails() {
  const { data, error } = await adminClient().rpc('claim_email_batch', { batch_size: 25 })
  if (error) throw new Error('Unable to claim queued emails')
  return data as QueuedEmail[]
}

export async function markEmailSent(id: string) {
  const { error } = await adminClient().rpc('mark_email_sent', { target_id: id })
  if (error) throw new Error('Unable to record email delivery')
}
