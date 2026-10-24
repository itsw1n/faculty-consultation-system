import { authorizeRole } from '@/features/auth/repositories/authRepository'
import { createClient } from '@/lib/supabase/server'
import { reportRangeSchema } from '@/features/consultations/schemas/reportRangeSchema'
import {
  facultyConsultationsCsv,
  type FacultyConsultationExportRow,
} from '@/features/consultations/services/facultyConsultationsCsv'

export async function GET(request: Request) {
  const access = await authorizeRole('FACULTY')
  if (!access.ok)
    return Response.json(
      { error: access.status === 401 ? 'Authentication required.' : 'Faculty access required.' },
      { status: access.status, headers: { 'Cache-Control': 'private, no-store' } }
    )

  const params = new URL(request.url).searchParams
  const dates = reportRangeSchema.safeParse({ from: params.get('from'), to: params.get('to') })
  if (!dates.success)
    return Response.json(
      { error: dates.error.issues[0]?.message ?? 'Invalid date range.' },
      { status: 400, headers: { 'Cache-Control': 'private, no-store' } }
    )

  const { data, error } = await (
    await createClient()
  ).rpc('export_my_faculty_consultations', {
    from_date: dates.data.from,
    to_date: dates.data.to,
  })
  if (error)
    return Response.json(
      { error: 'Unable to prepare consultation export.' },
      { status: 500, headers: { 'Cache-Control': 'private, no-store' } }
    )

  const rows = (data ?? []) as FacultyConsultationExportRow[]
  return new Response(facultyConsultationsCsv(rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="faculty-consultations-${dates.data.from}-to-${dates.data.to}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
