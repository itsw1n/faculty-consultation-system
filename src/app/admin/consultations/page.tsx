import { PageHeading } from '@/components/common/PageHeading'
import { ConsultationDirectory } from '@/features/consultations/components/ConsultationDirectory'
import { getConsultationPage } from '@/features/consultations/repositories/consultationRepository'
export default async function ConsultationRecords() {
  const today = new Date().toISOString().slice(0, 10)
  const from = `${today.slice(0, 4)}-01-01`
  return (
    <>
      <PageHeading
        title="Consultation Records"
        description="Read-only visibility across consultation activity."
      />
      <form
        action="/admin/consultations/export"
        method="get"
        className="mb-5 flex flex-wrap items-end gap-3 border-y border-border py-4"
      >
        <label className="grid gap-1 text-sm font-semibold">
          From{' '}
          <input
            className="min-h-11 rounded border border-border bg-surface px-3"
            type="date"
            name="from"
            defaultValue={from}
            required
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          To{' '}
          <input
            className="min-h-11 rounded border border-border bg-surface px-3"
            type="date"
            name="to"
            defaultValue={today}
            required
          />
        </label>
        <button type="submit" className="min-h-11 rounded bg-primary px-4 font-semibold text-white">
          Download summary CSV
        </button>
      </form>
      <ConsultationDirectory initialPage={await getConsultationPage({})} viewer="ADMIN" />
    </>
  )
}
