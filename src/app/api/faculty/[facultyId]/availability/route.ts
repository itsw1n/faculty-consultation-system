import { getAuthenticatedProfile } from '@/features/auth/repositories/authRepository'
import {
  facultyIdSchema,
  getFacultyAvailability,
} from '@/features/booking/services/facultyAvailability'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ facultyId: string }> }
) {
  const profile = await getAuthenticatedProfile()
  if (!profile) return Response.json({ error: 'Sign in required.' }, { status: 401 })
  if (profile.accountStatus !== 'APPROVED' || profile.role !== 'STUDENT')
    return Response.json({ error: 'Students only.' }, { status: 403 })
  const { facultyId } = await params
  if (!facultyIdSchema.safeParse(facultyId).success)
    return Response.json({ error: 'Invalid faculty id.' }, { status: 400 })
  try {
    const slots = await getFacultyAvailability(facultyId)
    return Response.json({ slots })
  } catch {
    return Response.json({ error: 'Unable to load schedules.' }, { status: 500 })
  }
}
