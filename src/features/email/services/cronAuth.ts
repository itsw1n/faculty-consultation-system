import { timingSafeEqual } from 'node:crypto'

export function isAuthorizedCronRequest(request: Request, secret: string | undefined): boolean {
  if (!secret) return false
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  const suppliedBytes = Buffer.from(supplied)
  const secretBytes = Buffer.from(secret)
  if (suppliedBytes.length !== secretBytes.length) return false
  return timingSafeEqual(suppliedBytes, secretBytes)
}
