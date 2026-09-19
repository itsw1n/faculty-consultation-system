'use client'
import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SearchInput } from '@/components/common/SearchInput'
import { Select } from '@/components/ui/select/Select'

const statusOptions = [
  { id: 'PENDING', label: 'Pending' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'all', label: 'All statuses' },
]

const roleOptions = [
  { id: 'all', label: 'All roles' },
  { id: 'STUDENT', label: 'Student' },
  { id: 'FACULTY', label: 'Faculty' },
]

export function ApplicationFilters({
  departments,
}: {
  departments: { id: string; code: string }[]
}) {
  const current = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [search, setSearch] = useState(current.get('search') ?? '')
  const update = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(current)
      if (value) params.set(name, value)
      else params.delete(name)
      router.replace(`${pathname}?${params}`)
    },
    [current, pathname, router]
  )
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search !== (current.get('search') ?? '')) update('search', search)
    }, 300)
    return () => clearTimeout(timeout)
  }, [search, current, update])
  const departmentOptions = [
    { id: 'all', label: 'All departments' },
    ...departments.map((item) => ({ id: item.id, label: item.code })),
  ]
  return (
    <div className="grid items-end gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:flex">
      <SearchInput
        label="Search"
        value={search}
        onChange={setSearch}
        placeholder="Search name or email"
      />
      <Select
        label="Status"
        options={statusOptions}
        value={current.get('status') ?? 'PENDING'}
        onChange={(value) => update('status', value === 'all' ? '' : value)}
      />
      <Select
        label="Role"
        options={roleOptions}
        value={current.get('role') ?? 'all'}
        onChange={(value) => update('role', value === 'all' ? '' : value)}
      />
      <Select
        label="Department"
        options={departmentOptions}
        value={current.get('department') ?? 'all'}
        onChange={(value) => update('department', value === 'all' ? '' : value)}
      />
    </div>
  )
}
