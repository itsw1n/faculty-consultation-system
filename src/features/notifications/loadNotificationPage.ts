'use server'
import { z } from 'zod'
import { getAuthenticatedProfile } from '@/features/auth/repositories/authRepository'
import { getNotificationPage } from './repositories/notificationRepository'
const schema=z.object({cursor:z.object({createdAt:z.iso.datetime(),id:z.uuid()}).nullable()})
export async function loadNotificationPage(input:unknown){const profile=await getAuthenticatedProfile();if(!profile||profile.accountStatus!=='APPROVED')throw new Error('Authentication required');const value=schema.parse(input);return getNotificationPage(value.cursor??undefined)}
