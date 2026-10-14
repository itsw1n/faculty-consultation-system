export type ApplicationItem = {
  id: string
  full_name: string
  email: string
  requested_role: 'STUDENT' | 'FACULTY' | null
  account_status: 'PENDING' | 'APPROVED' | 'REJECTED' | null
  department_name: string | null
  created_at: string
  role: 'STUDENT' | 'FACULTY' | 'ADMIN' | null
  department_id: string | null
}
