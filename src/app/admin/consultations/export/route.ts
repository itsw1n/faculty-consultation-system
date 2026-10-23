import { z } from 'zod'
import { authorizeRole } from '@/features/auth/repositories/authRepository'
import { createClient } from '@/lib/supabase/server'
import { summaryCsv, type SummaryRow } from '@/features/consultations/services/summaryCsv'

export async function GET(request: Request) {
  const access = await authorizeRole('ADMIN')
  if (!access.ok)
    return Response.json(
      {
        error:
          access.status === 401 ? 'Authentication required.' : 'Administrator access required.',
      },
      { status: access.status, headers: { 'Cache-Control': 'private, no-store' } }
    )
  const params = new URL(request.url).searchParams
  const dates = z
    .object({ from: z.iso.date(), to: z.iso.date() })
    .safeParse({ from: params.get('from'), to: params.get('to') })
  if (!dates.success) return new Response('Invalid date range', { status: 400 })
  const { from, to } = dates.data
  const span = (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000
  if (span < 0 || span > 366)
    return new Response('Choose a range of up to one year', { status: 400 })
  const { data, error } = await (
    await createClient()
  ).rpc('consultation_summary', { start_date: from, end_date: to })
  if (error) return new Response('Unable to prepare report', { status: 500 })
  return new Response(summaryCsv(data as SummaryRow[]), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="consultation-summary-${from}-to-${to}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
