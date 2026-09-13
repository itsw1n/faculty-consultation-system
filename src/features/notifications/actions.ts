'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getAuthenticatedProfile } from '@/features/auth/repositories/authRepository'
import { createClient } from '@/lib/supabase/server'
export async function markNotificationRead(formData:FormData){const profile=await getAuthenticatedProfile();if(!profile)throw new Error('Authentication required');const id=z.uuid().parse(formData.get('notificationId'));const{error}=await(await createClient()).from('notifications').update({read_at:new Date().toISOString()}).eq('id',id).is('read_at',null);if(error)throw new Error('Unable to update notification');revalidatePath('/notifications')}
export async function markAllNotificationsRead(){const profile=await getAuthenticatedProfile();if(!profile)throw new Error('Authentication required');const{error}=await(await createClient()).from('notifications').update({read_at:new Date().toISOString()}).is('read_at',null);if(error)throw new Error('Unable to update notifications');revalidatePath('/notifications')}
