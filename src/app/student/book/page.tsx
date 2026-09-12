import { PageHeading } from '@/components/common/PageHeading'
import { getDepartments } from '@/features/auth/repositories/authRepository'
import { FacultyDirectory } from '@/features/booking/components/FacultyDirectory'
import { getFacultyPage } from '@/features/booking/repositories/bookingRepository'
export default async function ChooseFaculty({searchParams}:{searchParams:Promise<{search?:string;department?:string}>}){const p=await searchParams;const[page,departments]=await Promise.all([getFacultyPage(p.search,p.department),getDepartments()]);return <><PageHeading title="Book Consultation" description="Choose a faculty member to view available schedules."/><FacultyDirectory key={`${p.search??''}:${p.department??''}`} initialPage={page} departments={departments}/></>}
