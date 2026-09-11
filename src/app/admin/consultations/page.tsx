import { ConsultationList } from '@/components/common/ConsultationList'
import { PageHeading } from '@/components/common/PageHeading'
import { listMyConsultations } from '@/features/consultations/repositories/consultationRepository'
export default async function ConsultationRecords(){return <><PageHeading title="Consultation Records" description="Read-only visibility across consultation activity."/><ConsultationList items={await listMyConsultations()} person="student"/></>}
