import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { ConsultationItem } from '../types'
export async function listMyConsultations(status?:ConsultationItem['consultation_status']){const{data,error}=await(await createClient()).rpc('list_my_consultations',{status_filter:status??null,result_limit:50});if(error)throw new Error('Unable to load consultations');return data as ConsultationItem[]}
