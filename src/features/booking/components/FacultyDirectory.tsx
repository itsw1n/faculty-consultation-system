'use client'

import Link from 'next/link'
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
  const { page, pending, markerRef } = useInfinitePage<FacultyResult, Cursor>({
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
      <div className="grid items-end gap-3 border-y border-border py-4 sm:flex">
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
      <div className="mt-5 divide-y divide-border border-y border-border bg-surface">
        {page.items.map((member) => (
          <article
            className="grid gap-4 px-1 py-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-4"
            key={member.id}
          >
            <div className="grid size-10 place-items-center rounded-full bg-subtle font-semibold text-primary">
              {member.full_name[0]}
            </div>
            <div>
              <h2 className="font-semibold text-primary">{member.full_name}</h2>
              <p className="mt-1 text-sm text-muted">
                {member.position_title} · {member.department_name}
              </p>
            </div>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary hover:bg-subtle focus-visible:outline-3 focus-visible:outline-focus"
              href={`/student/book/${member.id}`}
            >
              View schedule
            </Link>
          </article>
        ))}
      </div>
      <InfiniteListMarker
        markerRef={markerRef}
        pending={pending}
        hasMore={page.hasMore}
        pendingLabel="Loading more faculty…"
      />
    </>
  )
}
