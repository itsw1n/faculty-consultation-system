import Link from 'next/link'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeading } from '@/components/common/PageHeading'
export default function StudentDashboard() { return <><PageHeading title="Student Dashboard" description="Manage your faculty consultations."/><div className="dashboard-grid"><section className="summary-card"><span>Upcoming</span><strong>0</strong><p>Confirmed consultations</p></section><section className="summary-card"><span>Pending</span><strong>0</strong><p>Requests awaiting review</p></section></div><EmptyState title="No upcoming consultations" description="Choose a faculty member and request a suitable schedule." action={<Link className="inline-action" href="/student/book">Book Consultation</Link>}/></> }
