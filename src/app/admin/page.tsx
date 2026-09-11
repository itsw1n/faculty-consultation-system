import Link from 'next/link'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeading } from '@/components/common/PageHeading'
export default function AdminDashboard() { return <><PageHeading title="Admin Dashboard" description="Review applications and oversee consultation activity."/><div className="dashboard-grid"><section className="summary-card"><span>Pending applications</span><strong>0</strong><p>Users awaiting review</p></section><section className="summary-card"><span>Active faculty</span><strong>0</strong><p>Approved faculty accounts</p></section></div><EmptyState title="No pending applications" description="New student and faculty applications will appear here." action={<Link className="inline-action" href="/admin/users">Manage Users</Link>}/></> }
