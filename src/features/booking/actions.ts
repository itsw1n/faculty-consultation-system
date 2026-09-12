'use server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireRole } from '@/features/auth/repositories/authRepository'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '@/lib/actionState'
const schema=z.object({slotId:z.uuid(),purpose:z.string().trim().min(1).max(200),notes:z.string().trim().max(2000).optional()})
export async function bookConsultation(_state:ActionState,formData:FormData):Promise<ActionState>{await requireRole('STUDENT');const result=schema.safeParse({slotId:formData.get('slotId'),purpose:formData.get('purpose'),notes:formData.get('notes')||undefined});if(!result.success)return{error:'Check the consultation details.'};const input=result.data;const{error}=await(await createClient()).rpc('book_consultation',{target_slot_id:input.slotId,consultation_purpose:input.purpose,consultation_notes:input.notes??null});if(error)return{error:'This time is no longer available. Choose another slot.'};redirect('/student/consultations')}
