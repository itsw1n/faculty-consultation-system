import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'

export default function NotFound() {
  return <main><Section className="grid min-h-[70vh] place-content-center"><Container className="grid justify-items-center text-center"><h1 className="text-3xl font-bold">Page not found</h1><p className="my-4 max-w-xl text-muted">The page may have moved or you may not have access to it.</p><Link className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 py-2 font-bold text-white hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-focus" href="/auth/continue">Return to dashboard</Link></Container></Section></main>
}
