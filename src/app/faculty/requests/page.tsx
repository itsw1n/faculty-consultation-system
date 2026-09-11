import { ConsultationList } from '@/components/common/ConsultationList'
import { PageHeading } from '@/components/common/PageHeading'
import { decideConsultation } from '@/features/consultations/actions'
import { listMyConsultations } from '@/features/consultations/repositories/consultationRepository'
export default async function RequestsPage(){const items=await listMyConsultations('PENDING');return <><PageHeading title="Consultation Requests" description="Approve or reject requests for your reserved time slots."/><ConsultationList items={items} person="student" actions={item=><form action={decideConsultation} className="row-actions"><input type="hidden" name="consultationId" value={item.id}/><button name="approve" value="true">Approve</button><button className="danger-action" name="approve" value="false">Reject</button></form>}/></>}
