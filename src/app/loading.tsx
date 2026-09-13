import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'

export default function Loading() {
  return <main aria-busy="true" aria-live="polite"><Section className="grid min-h-[70vh] place-content-center"><Container className="grid justify-items-center text-center"><div className="size-10 animate-spin rounded-full border-5 border-border border-t-primary motion-reduce:animate-none" aria-hidden="true"/><h1 className="mt-4 text-2xl font-bold">Loading CampusConnect</h1><p className="mt-2 text-muted">Please wait while we prepare this page.</p></Container></Section></main>
}
