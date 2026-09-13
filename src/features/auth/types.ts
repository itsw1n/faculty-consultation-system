export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN'

export type AuthProfile = {
  accountStatus: ApplicationStatus | null
  email: string
  fullName: string
  requestedRole: UserRole | null
  role: UserRole | null
}
