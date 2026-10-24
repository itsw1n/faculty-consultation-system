import { categoryLabel } from '../categories'
import { formatConsultationDay, formatConsultationTime } from '../formatSchedule'
import type { ConsultationDetail } from '../repositories/consultationDetailRepository'
import { SubmitButton } from '@/components/common/SubmitButton'
import { ArrowLeft } from 'lucide-react'
import { StatusBadge } from '@/components/common/StatusBadge'
import { completeConsultation } from '../actions'
import { consultationIcs } from '../services/consultationIcs'
import Link from 'next/link'
import { safeHttpUrl } from '@/lib/safeNavigation'

export function ConsultationDetailView({
  detail,
  viewer,
}: {
  detail: ConsultationDetail
  viewer: 'STUDENT' | 'FACULTY'
}) {
  const back = `/${viewer.toLowerCase()}/consultations`
  const meetingLink =
    detail.meeting_link && ['APPROVED', 'COMPLETED'].includes(detail.consultation_status)
      ? safeHttpUrl(detail.meeting_link)
      : null
  const Root = 'section'
  return (
    <Root className="mx-auto max-w-4xl space-y-6">
      <Link
        href={back}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted hover:text-primary"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to consultations
      </Link>
      <h1 className="text-2xl font-semibold text-primary">Consultation details</h1>
      <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface px-5 text-sm [&>div]:grid [&>div]:gap-2 [&>div]:py-4 [&_dd]:break-words sm:[&>div]:grid-cols-[10rem_minmax(0,1fr)]">
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
            {formatConsultationDay(detail.slot_date)} ·{' '}
            {formatConsultationTime(detail.start_time, detail.end_time)}
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Mode</dt>
          <dd>{detail.mode === 'IN_PERSON' ? detail.location || 'Not specified' : 'Online'}</dd>
        </div>
        {meetingLink ? (
          <div>
            <dt className="font-semibold">Meeting link</dt>
            <dd>
              <a
                className="font-semibold text-primary underline"
                href={meetingLink}
                target="_blank"
                rel="noreferrer"
              >
                Join online consultation
              </a>
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="font-semibold">Status</dt>
          <dd>
            <StatusBadge status={detail.consultation_status} />
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Category</dt>
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
      {detail.consultation_status === 'APPROVED' && (
        <a
          href={`data:text/calendar;charset=utf-8,${encodeURIComponent(
            consultationIcs({
              id: detail.id,
              title: `Consultation with ${viewer === 'STUDENT' ? detail.faculty_name : detail.student_name}`,
              purpose: categoryLabel(detail.category),
              slot_date: detail.slot_date,
              start_time: detail.start_time,
              end_time: detail.end_time,
              location:
                detail.mode === 'IN_PERSON'
                  ? detail.location || 'Not specified'
                  : (meetingLink ?? 'Online'),
            })
          )}`}
          download={`consultation-${detail.slot_date}.ics`}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-surface px-4 py-2 text-sm font-bold text-primary ring-1 ring-border transition-colors hover:bg-subtle focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Add to calendar
        </a>
      )}
      {viewer === 'FACULTY' && detail.consultation_status === 'APPROVED' && (
        <form
          action={completeConsultation}
          className="grid gap-3 rounded-xl border border-border bg-surface p-5"
        >
          <p className="text-sm text-muted">
            Record the consultation outcome before marking it completed.
          </p>
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
          <div className="flex justify-end border-t border-border pt-4">
            <SubmitButton className="w-auto" pendingLabel="Completing…">
              Mark completed
            </SubmitButton>
          </div>
        </form>
      )}
    </Root>
  )
}
