import { ConsultationList } from '@/components/common/ConsultationList'
import { PageHeading } from '@/components/common/PageHeading'
import { completeConsultation } from '@/features/consultations/actions'
import { listMyConsultations } from '@/features/consultations/repositories/consultationRepository'
export default async function FacultyConsultations(){const items=await listMyConsultations();return <><PageHeading title="My Consultations" description="Review confirmed and completed consultations."/><ConsultationList items={items} person="student" actions={item=>item.consultation_status==='APPROVED'?<form action={completeConsultation}><input type="hidden" name="consultationId" value={item.id}/><button className="inline-action">Mark completed</button></form>:null}/></>}
