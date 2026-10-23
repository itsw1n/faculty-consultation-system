type DepartmentRelation = { name?: string | null } | { name?: string | null }[] | null

export function departmentName(value: DepartmentRelation): string | null {
  const relation = Array.isArray(value) ? value[0] : value
  return relation?.name ?? null
}
