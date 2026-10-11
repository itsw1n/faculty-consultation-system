import { timingSafeEqual } from 'node:crypto'
import { deliverEmails } from '@/features/email/services/deliverEmails'

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const supplied = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? ''
  if (
    !secret ||
    supplied.length !== secret.length ||
    !timingSafeEqual(Buffer.from(supplied), Buffer.from(secret))
  ) {
    return new Response('Unauthorized', { status: 401 })
  }
  try {
    return Response.json(await deliverEmails(true))
  } catch {
    return new Response('Email processing unavailable', { status: 503 })
  }
}
