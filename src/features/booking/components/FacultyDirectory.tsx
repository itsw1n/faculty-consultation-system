'use client'

import Link from 'next/link'
import { ArrowUpRight, GraduationCap } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { InfiniteListMarker } from '@/components/common/InfiniteListMarker'
import { SearchInput } from '@/components/common/SearchInput'
import { Select } from '@/components/common/select/Select'
import { useInfinitePage, type InfinitePage } from '@/lib/useInfinitePage'
import { getFacultyPage } from '../queries/getFacultyPage'
import type { FacultyResult } from '../repositories/bookingRepository'

type Cursor = { name: string; id: string }

export function FacultyDirectory({
  initialPage,
  departments,
}: {
  initialPage: InfinitePage<FacultyResult, Cursor>
  departments: { id: string; code: string }[]
}) {
  const [search, setSearch] = useState(useSearchParams().get('search') ?? '')
  const department = useSearchParams().get('department') ?? ''
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { page, pending, error, retry, markerRef } = useInfinitePage<FacultyResult, Cursor>({
    initialPage,
    fetchPage: (cursor) => getFacultyPage({ search, departmentId: department, cursor }),
  })
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (department) params.set('department', department)
      // Skip no-op replaces: a replace to the current URL aborts an
      // in-flight Link navigation, swallowing the user's first click.
      if (params.toString() !== searchParams.toString()) router.replace(`${pathname}?${params}`)
    }, 300)
    return () => clearTimeout(timeout)
  }, [search, department, pathname, router, searchParams])
  function changeDepartment(value: string) {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (value) params.set('department', value)
    router.replace(`${pathname}?${params}`)
  }

  return (
    <>
      <div className="grid items-end gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_16rem]">
        <SearchInput
          label="Faculty name"
          value={search}
          onChange={setSearch}
          placeholder="Search faculty"
        />
        <Select
          label="Department"
          options={[
            { id: 'all', label: 'All departments' },
            ...departments.map((item) => ({ id: item.id, label: item.code })),
          ]}
          value={department || 'all'}
          onChange={(value) => changeDepartment(value === 'all' ? '' : value)}
        />
      </div>
      <p className="mt-5 mb-3 text-xs text-muted" role="status">
        {pending
          ? 'Loading faculty…'
          : `${page.items.length}${page.hasMore ? '+' : ''} faculty members`}
      </p>
      {page.items.length === 0 && (
        <EmptyState
          title="No faculty found"
          description="Try another name or choose a different department."
          action={
            <Link
              href="/student/book"
              className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-semibold text-primary hover:bg-subtle"
            >
              Clear filters
            </Link>
          }
        />
      )}
      <div className="grid gap-4 xl:grid-cols-2">
        {page.items.map((member) => (
          <article
            className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-xl border border-border bg-surface p-5"
            key={member.id}
          >
            <div className="grid size-11 place-items-center rounded-full bg-subtle font-semibold text-primary">
              {member.full_name[0]}
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">{member.full_name}</h2>
              <p className="mt-1 text-sm text-muted">
                {member.position_title}
                <span className="mt-3 flex items-center gap-1.5 text-xs">
                  <GraduationCap size={15} aria-hidden="true" />
                  {member.department_name}
                </span>
              </p>
            </div>
            <Link
              className="col-span-2 mt-2 inline-flex min-h-11 items-center justify-between border-t border-border pt-4 text-sm font-semibold text-primary hover:bg-subtle focus-visible:outline-3 focus-visible:outline-focus"
              href={`/student/book/${member.id}`}
            >
              View schedule <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
      <InfiniteListMarker
        markerRef={markerRef}
        error={error}
        onRetry={retry}
        pending={pending}
        hasMore={page.hasMore}
        pendingLabel="Loading more faculty…"
      />
    </>
  )
}
