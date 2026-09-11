'use server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireRole } from '@/features/auth/repositories/authRepository'
import { createClient } from '@/lib/supabase/server'
const schema=z.object({slotId:z.uuid(),purpose:z.string().trim().min(1).max(200),notes:z.string().trim().max(2000).optional()})
export async function bookConsultation(formData:FormData){await requireRole('STUDENT');const input=schema.parse({slotId:formData.get('slotId'),purpose:formData.get('purpose'),notes:formData.get('notes')||undefined});const{error}=await(await createClient()).rpc('book_consultation',{target_slot_id:input.slotId,consultation_purpose:input.purpose,consultation_notes:input.notes??null});if(error)throw new Error('This time is no longer available. Choose another slot.');redirect('/student/consultations')}
