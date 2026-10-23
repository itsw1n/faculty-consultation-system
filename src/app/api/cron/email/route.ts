import { isAuthorizedCronRequest } from '@/features/email/services/cronAuth'
import { deliverEmails } from '@/features/email/services/deliverEmails'

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request, process.env.CRON_SECRET)) {
    return new Response('Unauthorized', { status: 401 })
  }
  try {
    return Response.json(await deliverEmails(true))
  } catch {
    return new Response('Email processing unavailable', { status: 503 })
  }
}
