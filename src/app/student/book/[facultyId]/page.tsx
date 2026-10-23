import { notFound } from 'next/navigation'
import { PageHeading } from '@/components/common/PageHeading'
import { BookingWizard } from '@/features/booking/components/BookingWizard'
import { listFacultySlots } from '@/features/booking/repositories/bookingRepository'
export default async function ChooseSchedule({
  params,
}: {
  params: Promise<{ facultyId: string }>
}) {
  const { facultyId } = await params
  if (!/^[0-9a-f-]{36}$/i.test(facultyId)) notFound()
  return (
    <>
      <PageHeading
        title="Book a Consultation"
        description="Choose an available schedule, add details, and review your request."
      />
      <BookingWizard facultyId={facultyId} initialSlots={await listFacultySlots(facultyId)} />
    </>
  )
}
