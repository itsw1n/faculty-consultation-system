import { ConsultationList } from '@/components/common/ConsultationList'
import { PageHeading } from '@/components/common/PageHeading'
import { completeConsultation } from '@/features/consultations/actions'
import { listMyConsultations } from '@/features/consultations/repositories/consultationRepository'
import { ConfirmAction } from '@/components/common/ConfirmAction'
export default async function FacultyConsultations(){const items=await listMyConsultations();return <><PageHeading title="My Consultations" description="Review confirmed and completed consultations."/><ConsultationList items={items} person="student" actions={item=>item.consultation_status==='APPROVED'?<ConfirmAction label="Mark completed" title="Complete consultation?" description="This closes the schedule and records the consultation as completed." fields={{consultationId:item.id}} submitAction={completeConsultation}/>:null}/></>}
