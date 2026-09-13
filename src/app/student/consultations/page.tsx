import { ConsultationList } from '@/components/common/ConsultationList'
import { PageHeading } from '@/components/common/PageHeading'
import { cancelConsultation } from '@/features/consultations/actions'
import { listMyConsultations } from '@/features/consultations/repositories/consultationRepository'
import { ConfirmAction } from '@/components/common/ConfirmAction'
export default async function StudentConsultations(){const items=await listMyConsultations();return <><PageHeading title="My Consultations" description="Track requests and confirmed consultations."/><ConsultationList items={items} person="faculty" actions={item=>['PENDING','APPROVED'].includes(item.consultation_status)?<ConfirmAction label="Cancel" title="Cancel consultation?" description="The selected schedule will become available again." fields={{consultationId:item.id}} submitAction={cancelConsultation} variant="danger"/>:null}/></>}
