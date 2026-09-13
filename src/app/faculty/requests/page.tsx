import { PageHeading } from '@/components/common/PageHeading'
import { ConsultationDirectory } from '@/features/consultations/components/ConsultationDirectory'
import { getConsultationPage } from '@/features/consultations/repositories/consultationRepository'
export default async function RequestsPage() {
  return (
    <>
      <PageHeading
        title="Consultation Requests"
        description="Approve or reject requests for your reserved time slots."
      />
      <ConsultationDirectory
        initialPage={await getConsultationPage({ status: 'PENDING' })}
        viewer="FACULTY"
        fixedStatus="PENDING"
      />
    </>
  )
}
