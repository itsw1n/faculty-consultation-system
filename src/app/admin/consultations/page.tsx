import { PageHeading } from '@/components/common/PageHeading'
import { ConsultationDirectory } from '@/features/consultations/components/ConsultationDirectory'
import { getConsultationPage } from '@/features/consultations/repositories/consultationRepository'
export default async function ConsultationRecords() {
  return (
    <>
      <PageHeading
        title="Consultation Records"
        description="Read-only visibility across consultation activity."
      />
      <ConsultationDirectory initialPage={await getConsultationPage({})} viewer="ADMIN" />
    </>
  )
}
