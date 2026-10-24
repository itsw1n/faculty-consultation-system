import { z } from 'zod'
import { PageHeading } from '@/components/common/PageHeading'
import { ConsultationDirectory } from '@/features/consultations/components/ConsultationDirectory'
import { getConsultationPage } from '@/features/consultations/repositories/consultationRepository'

const statusSchema = z
  .enum(['all', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'])
  .catch('PENDING')

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>
}) {
  const requestedStatus = statusSchema.parse((await searchParams).status)
  const status = requestedStatus === 'all' ? undefined : requestedStatus
  return (
    <>
      <PageHeading
        eyebrow="Faculty workspace"
        title="Consultation Requests"
        description="Review consultation requests, approve or reject them, and filter by status."
      />
      <ConsultationDirectory
        initialPage={await getConsultationPage({ status })}
        viewer="FACULTY"
        initialStatus={status}
        statusInUrl
        allowDecisions
      />
    </>
  )
}
