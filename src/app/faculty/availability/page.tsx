import { listOwnAvailability } from '@/features/availability/repositories/availabilityRepository'
import { AvailabilityManager } from '@/features/availability/components/AvailabilityManager'

export default async function AvailabilityPage() {
  const slots = await listOwnAvailability()
  return <AvailabilityManager slots={slots} />
}
