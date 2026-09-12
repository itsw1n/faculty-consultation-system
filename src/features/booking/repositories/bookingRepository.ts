import 'server-only'
import { createClient } from '@/lib/supabase/server'
type FacultyResult={id:string;full_name:string;department_name:string;position_title:string}
export type SlotResult={id:string;slot_date:string;start_time:string;end_time:string;slot_status:'OPEN'|'RESERVED'|'BOOKED'|'CLOSED';mode:'IN_PERSON'|'ONLINE';location:string|null}
export async function listFaculty(search='', departmentId?: string) { const { data,error }=await (await createClient()).rpc('list_faculty',{faculty_search:search,department_filter:departmentId||null,result_limit:20}); if(error) throw new Error('Unable to load faculty'); return data as FacultyResult[] }
export async function listFacultySlots(facultyId:string) { const start=new Date(); const end=new Date(start); end.setDate(end.getDate()+28); const {data,error}=await (await createClient()).rpc('list_faculty_slots',{target_faculty_id:facultyId,range_start:start.toISOString().slice(0,10),range_end:end.toISOString().slice(0,10)}); if(error) throw new Error('Unable to load schedules'); return data as SlotResult[] }
