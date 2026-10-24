import { manilaDateKey } from '@/lib/manilaTime'
import { Download, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/common/button/Button'
import { PageHeading } from '@/components/common/PageHeading'
import { ConsultationDirectory } from '@/features/consultations/components/ConsultationDirectory'
import { getConsultationPage } from '@/features/consultations/repositories/consultationRepository'
import { requireRole } from '@/features/auth/repositories/authRepository'
export default async function ConsultationRecords() {
  await requireRole('ADMIN')
  const today = manilaDateKey()
  const from = `${today.slice(0, 4)}-01-01`
  return (
    <>
      <PageHeading
        eyebrow="Administration workspace"
        title="Consultation Records"
        description="Review consultation metadata across the school. Descriptions and outcomes remain private."
      />
      <section
        className="mb-5 rounded-xl border border-border bg-surface p-5"
        aria-labelledby="export-heading"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-subtle text-primary">
            <FileSpreadsheet size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 id="export-heading" className="text-base font-semibold text-foreground">
              Summary export
            </h2>
            <p className="mt-1 text-xs text-muted">
              Download aggregate totals for a date range. These dates apply to the CSV only.
            </p>
          </div>
        </div>
        <form
          action="/admin/consultations/export"
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
            Download summary CSV
          </Button>
        </form>
      </section>
      <ConsultationDirectory initialPage={await getConsultationPage({})} viewer="ADMIN" />
    </>
  )
}
