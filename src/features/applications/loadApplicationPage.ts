'use server'
import { z } from 'zod'
import { requireRole } from '@/features/auth/repositories/authRepository'
import { getApplicationPage } from './repositories/applicationRepository'
const schema=z.object({search:z.string().max(200),status:z.enum(['PENDING','APPROVED','REJECTED']).nullable(),role:z.enum(['STUDENT','FACULTY']).nullable(),department:z.uuid().nullable(),cursor:z.object({createdAt:z.iso.datetime(),id:z.uuid()}).nullable()})
export async function loadApplicationPage(input:unknown){await requireRole('ADMIN');const value=schema.parse(input);return getApplicationPage({search:value.search,status:value.status??'',role:value.role??'',department:value.department??'',cursor:value.cursor??undefined})}
