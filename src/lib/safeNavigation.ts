const INTERNAL_ORIGIN = 'https://internal.invalid'

export function safeNextPath(
  value: string | null | undefined,
  fallback = '/auth/continue'
): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback

  let decoded: string
  try {
    decoded = decodeURIComponent(value)
  } catch {
    return fallback
  }

  if (decoded.startsWith('//') || decoded.includes('\\')) return fallback

  try {
    const url = new URL(value, INTERNAL_ORIGIN)
    if (url.origin !== INTERNAL_ORIGIN) return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}

export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}
