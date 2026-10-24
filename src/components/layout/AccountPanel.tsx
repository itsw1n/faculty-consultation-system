import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import logo from '@/assets/acd-logo.png'

/** A consistent, compact entry surface for account and recovery workflows. */
export function AccountPanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-8 text-sm sm:py-12 [&_input]:font-normal">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 flex min-h-11 items-center justify-center gap-3 rounded-md text-primary focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus"
        >
          <Image src={logo} alt="" width={40} height={40} unoptimized className="size-10" />
          <span className="max-w-48 text-sm leading-snug font-semibold">
            Assumption College of Davao
          </span>
        </Link>
        <section className="rounded-xl border border-border bg-surface p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-wider text-muted uppercase">{eyebrow}</p>
          <h1 className="mt-3 text-2xl leading-tight font-semibold tracking-tight text-primary">
            {title}
          </h1>
          <p className="mt-3 leading-relaxed text-muted">{description}</p>
          {children}
        </section>
        <p className="mt-5 text-center text-xs text-muted">Faculty consultation &amp; scheduling</p>
      </div>
    </main>
  )
}
