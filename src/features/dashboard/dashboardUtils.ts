export function selectRecentConsultations<T extends { id: string; consultation_status: string }>(
  items: T[],
  excludedIds: Set<string>,
  limit: number
) {
  return items
    .filter((item) => item.consultation_status !== 'PENDING' && !excludedIds.has(item.id))
    .slice(0, limit)
}
