export type SummaryRow = {
  slot_date: string
  department: string
  category: string
  status: string
  total: number
}

function cell(value: string | number) {
  const text = String(value)
  return `"${(/^[=+\-@\t\r]/.test(text) ? "'" : '') + text.replaceAll('"', '""')}"`
}

export function summaryCsv(rows: SummaryRow[]) {
  return (
    [
      'Date,Department,Category,Status,Count',
      ...rows.map((row) =>
        [row.slot_date, row.department, row.category, row.status, row.total].map(cell).join(',')
      ),
    ].join('\r\n') + '\r\n'
  )
}
