import { ConsultationList } from '@/components/common/ConsultationList'
import { PageHeading } from '@/components/common/PageHeading'
import { decideConsultation } from '@/features/consultations/actions'
import { listMyConsultations } from '@/features/consultations/repositories/consultationRepository'
import { ConfirmAction } from '@/components/common/ConfirmAction'
export default async function RequestsPage(){const items=await listMyConsultations('PENDING');return <><PageHeading title="Consultation Requests" description="Approve or reject requests for your reserved time slots."/><ConsultationList items={items} person="student" actions={item=><div className="row-actions"><ConfirmAction label="Approve" title="Approve consultation?" description="This confirms the selected schedule for the student." fields={{consultationId:item.id,approve:'true'}} submitAction={decideConsultation}/><ConfirmAction label="Reject" title="Reject consultation?" description="The time slot will become available to students again." fields={{consultationId:item.id,approve:'false'}} submitAction={decideConsultation} variant="danger"/></div>}/></>}
