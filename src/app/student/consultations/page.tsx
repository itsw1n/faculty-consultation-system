import { ConsultationList } from '@/components/common/ConsultationList'
import { PageHeading } from '@/components/common/PageHeading'
import { cancelConsultation } from '@/features/consultations/actions'
import { listMyConsultations } from '@/features/consultations/repositories/consultationRepository'
export default async function StudentConsultations(){const items=await listMyConsultations();return <><PageHeading title="My Consultations" description="Track requests and confirmed consultations."/><ConsultationList items={items} person="faculty" actions={item=>['PENDING','APPROVED'].includes(item.consultation_status)?<form action={cancelConsultation}><input type="hidden" name="consultationId" value={item.id}/><button className="danger-link">Cancel</button></form>:null}/></>}
