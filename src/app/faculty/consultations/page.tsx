import { manilaDateKey } from '@/lib/manilaTime'
import { Download, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/common/button/Button'
import { PageHeading } from '@/components/common/PageHeading'
import { ConsultationDirectory } from '@/features/consultations/components/ConsultationDirectory'
import { getConsultationPage } from '@/features/consultations/repositories/consultationRepository'
export default async function FacultyConsultations() {
  const today = manilaDateKey()
  const from = `${today.slice(0, 4)}-01-01`
  return (
    <>
      <PageHeading
        eyebrow="Faculty workspace"
        title="My Consultations"
        description="Review confirmed and completed consultations."
      />
      <section
        className="mb-5 rounded-xl border border-border bg-surface p-5"
        aria-labelledby="faculty-export-heading"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-subtle text-primary">
            <FileSpreadsheet size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 id="faculty-export-heading" className="text-base font-semibold text-foreground">
              Consultation records export
            </h2>
            <p className="mt-1 text-xs text-muted">
              Download your consultation statuses and schedules for up to 366 days. Private notes,
              outcomes, and meeting links are excluded.
            </p>
          </div>
        </div>
        <form
          action="/faculty/consultations/export"
          method="get"
          className="mt-4 grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
        >
          <label className="grid gap-1.5 text-xs font-semibold">
            From{' '}
            <input
              className="min-h-11 min-w-0 w-full rounded-lg border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus"
              type="date"
              name="from"
              defaultValue={from}
              required
            />
          </label>
          <label className="grid gap-1.5 text-xs font-semibold">
            To{' '}
            <input
              className="min-h-11 min-w-0 w-full rounded-lg border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus"
              type="date"
              name="to"
              defaultValue={today}
              required
            />
          </label>
          <Button
            type="submit"
            variant="secondary"
            className="gap-2 whitespace-normal sm:col-span-2 xl:col-span-1"
          >
            <Download size={16} aria-hidden="true" />
            Download CSV
          </Button>
        </form>
      </section>
      <ConsultationDirectory initialPage={await getConsultationPage({})} viewer="FACULTY" />
    </>
  )
}
