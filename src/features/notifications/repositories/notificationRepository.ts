import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { NotificationItem } from '../types'
export async function listNotifications(limit=20){const{data,error}=await(await createClient()).from('notifications').select('id,type,title,message,read_at,created_at').order('created_at',{ascending:false}).limit(limit);if(error)throw new Error('Unable to load notifications');return data as NotificationItem[]}
