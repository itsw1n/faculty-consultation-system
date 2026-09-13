'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SearchInput } from '@/components/common/SearchInput'
import { loadFacultyPage } from '../loadFacultyPage'
import type { FacultyResult } from '../repositories/bookingRepository'

type Page = { items: FacultyResult[]; hasMore: boolean; nextCursor: { name: string; id: string } | null }

export function FacultyDirectory({ initialPage, departments }: { initialPage: Page; departments: { id: string; code: string }[] }) {
  const [page, setPage] = useState(initialPage)
  const [pending, startTransition] = useTransition()
  const [search, setSearch] = useState(useSearchParams().get('search') ?? '')
  const department = useSearchParams().get('department') ?? ''
  const router = useRouter()
  const pathname = usePathname()
  const marker = useRef<HTMLDivElement>(null)
  useEffect(() => { const timeout = setTimeout(() => { const params = new URLSearchParams(); if (search) params.set('search', search); if (department) params.set('department', department); router.replace(`${pathname}?${params}`) }, 300); return () => clearTimeout(timeout) }, [search, department, pathname, router])
  useEffect(() => { const node = marker.current; if (!node || !page.hasMore || pending) return; const observer = new IntersectionObserver((entries) => { if (entries[0]?.isIntersecting && page.nextCursor) startTransition(async () => { const next = await loadFacultyPage({ search, departmentId: department, cursor: page.nextCursor }); setPage((current) => ({ ...next, items: [...current.items, ...next.items] })) }) }, { rootMargin: '200px' }); observer.observe(node); return () => observer.disconnect() }, [page, search, department, pending])
  function changeDepartment(value: string) { const params = new URLSearchParams(); if (search) params.set('search', search); if (value) params.set('department', value); router.replace(`${pathname}?${params}`) }

  return <><div className="grid items-end gap-3 rounded-xl border border-border bg-surface p-4 sm:flex"><SearchInput label="Faculty name" value={search} onChange={setSearch} placeholder="Search faculty"/><label className="grid flex-1 gap-1.5 text-xs font-bold"><span>Department</span><select className="min-h-11 rounded-lg border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus" value={department} onChange={(event) => changeDepartment(event.target.value)}><option value="">All departments</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.code}</option>)}</select></label></div><div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">{page.items.map((member) => <article className="rounded-xl border border-border bg-surface p-5 shadow-card" key={member.id}><div className="grid size-10 place-items-center rounded-full bg-primary font-extrabold text-white">{member.full_name[0]}</div><h2 className="mt-3 font-bold">{member.full_name}</h2><p className="mt-1 text-sm text-muted">{member.position_title}</p><p className="mt-1 text-sm text-muted">{member.department_name}</p><Link className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-focus" href={`/student/book/${member.id}`}>View schedule</Link></article>)}</div><div ref={marker} className="grid min-h-12 place-items-center text-sm text-muted" aria-live="polite">{pending ? 'Loading more faculty…' : page.hasMore ? 'Scroll for more' : ''}</div></>
}
