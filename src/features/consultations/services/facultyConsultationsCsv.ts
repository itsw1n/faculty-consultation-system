export type FacultyConsultationExportRow = {
  consultation_id: string
  student_name: string
  category: string
  consultation_status: string
  slot_date: string
  start_time: string
  end_time: string
  mode: string
  location: string | null
  created_at: string
}

function csvCell(value: string | number | null) {
  const text = value == null ? '' : String(value)
  const safeText = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
  return `"${safeText.replaceAll('"', '""')}"`
}

export function facultyConsultationsCsv(rows: FacultyConsultationExportRow[]) {
  const header = [
    'Consultation ID',
    'Student',
    'Category',
    'Status',
    'Date',
    'Start time',
    'End time',
    'Mode',
    'Location',
    'Requested at',
  ]

  return (
    [
      header.map(csvCell).join(','),
      ...rows.map((row) =>
        [
          row.consultation_id,
          row.student_name,
          row.category,
          row.consultation_status,
          row.slot_date,
          row.start_time,
          row.end_time,
          row.mode,
          row.location,
          row.created_at,
        ]
          .map(csvCell)
          .join(',')
      ),
    ].join('\r\n') + '\r\n'
  )
}
