'use client'

import { useActionState, useState } from 'react'
import { GraduationCap, Users } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { SubmitButton } from '@/components/common/SubmitButton'
import { initialActionState } from '@/lib/actionState'
import { submitApplication } from '../actions'

type RequestedRole = 'STUDENT' | 'FACULTY'
const fieldClass = 'grid gap-1.5 text-sm font-bold'
const controlClass = 'min-h-11 w-full rounded-lg border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus read-only:bg-subtle read-only:text-muted'

export function ApplicationFlow({ fullName, email, departments }: { fullName: string; email: string; departments: { id: string; code: string; name: string }[] }) {
  const [role, setRole] = useState<RequestedRole | null>(null)
  const [state, formAction] = useActionState(submitApplication, initialActionState)

  if (!role) return <section className="mx-auto w-full max-w-4xl text-center"><p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">Get started</p><h1 className="my-3 text-3xl font-bold sm:text-5xl">Choose application type</h1><p className="text-muted">Tell us how you’ll use CampusConnect so an administrator can review your access.</p><div className="mt-8 grid gap-4 sm:grid-cols-2">{([{ role: 'STUDENT' as const, icon: GraduationCap, title: 'Apply as Student', description: 'Discover faculty and request consultation schedules.' }, { role: 'FACULTY' as const, icon: Users, title: 'Apply as Faculty', description: 'Publish availability and review consultation requests.' }]).map(({ role: option, icon: Icon, title, description }) => <button key={option} className="grid justify-items-center gap-3 rounded-xl border border-border bg-surface p-8 text-foreground shadow-card transition-colors hover:border-accent focus-visible:outline-3 focus-visible:outline-focus" onClick={() => setRole(option)}><Icon className="size-12 text-accent" aria-hidden="true"/><strong className="text-xl">{title}</strong><span className="text-muted">{description}</span></button>)}</div></section>

  return <section className="mx-auto w-full max-w-3xl rounded-xl border border-border bg-surface p-6 shadow-card sm:p-12"><Button variant="ghost" className="px-0" onPress={() => setRole(null)}>Back to application types</Button><p className="mt-4 text-xs font-bold tracking-[0.12em] text-primary uppercase">Application</p><h1 className="my-3 text-3xl font-bold sm:text-5xl">{role === 'STUDENT' ? 'Student' : 'Faculty'} Application</h1><p className="text-muted">Confirm your school information and select your department.</p><form action={formAction} className="mt-8 grid gap-4 sm:grid-cols-2"><input type="hidden" name="requestedRole" value={role}/><label className={fieldClass}>Full name<input className={controlClass} value={fullName} readOnly/></label><label className={fieldClass}>School email<input className={controlClass} value={email} readOnly/></label><label className={fieldClass}>Department<select className={controlClass} name="departmentId" required><option value="">Select a department</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.code} — {department.name}</option>)}</select></label>{role === 'FACULTY' && <label className={fieldClass}>Position title<input className={controlClass} name="positionTitle" required maxLength={120} placeholder="e.g. Instructor"/></label>}<p className="min-h-5 text-sm font-semibold text-danger sm:col-span-2" role="alert">{state.error}</p><SubmitButton className="sm:col-span-2" pendingLabel="Submitting application…">Submit application</SubmitButton></form></section>
}
