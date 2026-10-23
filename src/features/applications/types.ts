export type ApplicationItem = {
  id: string
  full_name: string
  email: string
  account_status: 'PENDING' | 'APPROVED' | 'REJECTED' | null
  department_name: string | null
  created_at: string
  role: 'STUDENT' | 'FACULTY' | 'ADMIN' | null
  department_id: string | null
  position_title: string | null
}
