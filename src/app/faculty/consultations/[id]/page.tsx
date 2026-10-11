import { notFound } from 'next/navigation'
import { requireRole } from '@/features/auth/repositories/authRepository'
import { ConsultationDetailView } from '@/features/consultations/components/ConsultationDetailView'
import { getConsultationDetail } from '@/features/consultations/repositories/consultationDetailRepository'
import { z } from 'zod'

export default async function FacultyConsultationDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireRole('FACULTY')
  const { id } = await params
  if (!z.uuid().safeParse(id).success) notFound()
  const detail = await getConsultationDetail(id)
  if (!detail) notFound()
  return <ConsultationDetailView detail={detail} viewer="FACULTY" />
}
