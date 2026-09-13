import { PageHeading } from '@/components/common/PageHeading'
import { ConsultationDirectory } from '@/features/consultations/components/ConsultationDirectory'
import { getConsultationPage } from '@/features/consultations/repositories/consultationRepository'
export default async function StudentConsultations() {
  return (
    <>
      <PageHeading
        title="My Consultations"
        description="Track requests and confirmed consultations."
      />
      <ConsultationDirectory initialPage={await getConsultationPage({})} viewer="STUDENT" />
    </>
  )
}
