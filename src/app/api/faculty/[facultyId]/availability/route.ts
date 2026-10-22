import { getAuthenticatedProfile } from '@/features/auth/repositories/authRepository'
import {
  availabilityRangeSchema,
  facultyIdSchema,
  getFacultyAvailability,
} from '@/features/booking/services/facultyAvailability'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ facultyId: string }> }
) {
  const profile = await getAuthenticatedProfile()
  if (!profile) return Response.json({ error: 'Sign in required.' }, { status: 401 })
  if (profile.accountStatus !== 'APPROVED' || profile.role !== 'STUDENT')
    return Response.json({ error: 'Students only.' }, { status: 403 })
  const { facultyId } = await params
  if (!facultyIdSchema.safeParse(facultyId).success)
    return Response.json({ error: 'Invalid faculty id.' }, { status: 400 })
  const searchParams = new URL(request.url).searchParams
  const start = searchParams.get('start')
  const end = searchParams.get('end')
  const range = start || end ? availabilityRangeSchema.safeParse({ start, end }) : null
  if (range && !range.success)
    return Response.json({ error: 'Invalid availability range.' }, { status: 400 })
  try {
    const slots = range
      ? await getFacultyAvailability(facultyId, range.data)
      : await getFacultyAvailability(facultyId)
    return Response.json({ slots })
  } catch {
    return Response.json({ error: 'Unable to load schedules.' }, { status: 500 })
  }
}
