type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN'

export type AuthProfile = {
  id: string
  accountStatus: ApplicationStatus | null
  email: string
  fullName: string
  departmentName: string | null
  positionTitle: string | null
  requestedRole: UserRole | null
  role: UserRole | null
}
