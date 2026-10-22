import { categoryLabel } from '../categories'
import type { ConsultationDetail } from '../repositories/consultationDetailRepository'
import { Button } from '@/components/common/button/Button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { completeConsultation } from '../actions'
import Link from 'next/link'

export function ConsultationDetailView({
  detail,
  viewer,
}: {
  detail: ConsultationDetail
  viewer: 'STUDENT' | 'FACULTY'
}) {
  const back = `/${viewer.toLowerCase()}/consultations`
  return (
    <main className="mx-auto max-w-2xl space-y-6">
      <Link href={back} className="font-semibold text-primary underline">
        Back to consultations
      </Link>
      <h1 className="text-2xl font-semibold text-primary">Consultation details</h1>
      <dl className="divide-y divide-border border-y border-border [&>div]:grid [&>div]:gap-1 [&>div]:py-3 sm:[&>div]:grid-cols-[10rem_1fr]">
        <div>
          <dt className="font-semibold">Student</dt>
          <dd>{detail.student_name}</dd>
        </div>
        <div>
          <dt className="font-semibold">Faculty</dt>
          <dd>{detail.faculty_name}</dd>
        </div>
        <div>
          <dt className="font-semibold">Date and time</dt>
          <dd>
            {detail.slot_date}, {detail.start_time.slice(0, 5)}–{detail.end_time.slice(0, 5)}
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Mode</dt>
          <dd>{detail.mode === 'IN_PERSON' ? detail.location : 'Online'}</dd>
        </div>
        <div>
          <dt className="font-semibold">Status</dt>
          <dd>
            <StatusBadge status={detail.consultation_status} />
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Purpose</dt>
          <dd>{categoryLabel(detail.category)}</dd>
        </div>
        <div>
          <dt className="font-semibold">Description</dt>
          <dd className="whitespace-pre-wrap">{detail.description || 'None provided'}</dd>
        </div>
        {detail.consultation_status === 'COMPLETED' && (
          <div>
            <dt className="font-semibold">Outcome</dt>
            <dd className="whitespace-pre-wrap">{detail.outcome || 'No outcome note recorded'}</dd>
          </div>
        )}
      </dl>
      {viewer === 'FACULTY' && detail.consultation_status === 'APPROVED' && (
        <form action={completeConsultation} className="grid gap-3">
          <input type="hidden" name="consultationId" value={detail.id} />
          <label htmlFor="outcome" className="font-semibold">
            Outcome note (optional)
          </label>
          <textarea
            id="outcome"
            name="outcome"
            maxLength={2000}
            rows={5}
            className="rounded-md border border-border bg-surface p-3 outline-none focus-visible:ring-3 focus-visible:ring-focus"
          />
          <Button type="submit">Mark completed</Button>
        </form>
      )}
    </main>
  )
}
