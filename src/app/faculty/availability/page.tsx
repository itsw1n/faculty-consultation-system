import { PageHeading } from '@/components/common/PageHeading'
import { listOwnAvailability } from '@/features/availability/repositories/availabilityRepository'
import { AvailabilityManager } from '@/features/availability/components/AvailabilityManager'

export default async function AvailabilityPage() {
  const slots = await listOwnAvailability()
  return <><PageHeading title="My Availability" description="Create consultation times and review their booking status."/><AvailabilityManager slots={slots}/></>
}
