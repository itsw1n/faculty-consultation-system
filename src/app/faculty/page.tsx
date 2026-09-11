import Link from 'next/link'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeading } from '@/components/common/PageHeading'
export default function FacultyDashboard() { return <><PageHeading title="Faculty Dashboard" description="Manage availability and consultation requests."/><div className="dashboard-grid"><section className="summary-card"><span>Pending requests</span><strong>0</strong><p>Requests needing a decision</p></section><section className="summary-card"><span>Upcoming</span><strong>0</strong><p>Approved consultations</p></section></div><EmptyState title="No availability added" description="Add an available time so students can request a consultation." action={<Link className="inline-action" href="/faculty/availability">Add Availability</Link>}/></> }
