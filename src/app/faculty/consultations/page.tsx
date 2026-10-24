import { PageHeading } from '@/components/common/PageHeading'
import { ConsultationDirectory } from '@/features/consultations/components/ConsultationDirectory'
import { getConsultationPage } from '@/features/consultations/repositories/consultationRepository'
export default async function FacultyConsultations() {
  return (
    <>
      <PageHeading
        eyebrow="Faculty workspace"
        title="My Consultations"
        description="Review confirmed and completed consultations."
      />
      <ConsultationDirectory initialPage={await getConsultationPage({})} viewer="FACULTY" />
    </>
  )
}
