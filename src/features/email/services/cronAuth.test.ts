import { describe, expect, test } from 'vitest'
import { isAuthorizedCronRequest } from './cronAuth'

const request = (authorization?: string) =>
  new Request('http://localhost/api/cron/email', {
    headers: authorization ? { authorization } : undefined,
  })

describe('isAuthorizedCronRequest', () => {
  test('accepts the configured bearer secret', () => {
    expect(isAuthorizedCronRequest(request('Bearer top-secret'), 'top-secret')).toBe(true)
  })

  test('rejects missing, wrong, or unconfigured secrets', () => {
    expect(isAuthorizedCronRequest(request(), 'top-secret')).toBe(false)
    expect(isAuthorizedCronRequest(request('Bearer wrong'), 'top-secret')).toBe(false)
    expect(isAuthorizedCronRequest(request('Bearer top-secret'), undefined)).toBe(false)
  })

  test('does not throw when multibyte secrets have different byte lengths', () => {
    expect(isAuthorizedCronRequest(request('Bearer a'), 'é')).toBe(false)
  })
})
