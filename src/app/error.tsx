'use client'

import { Button } from '@/components/common/Button'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main role="alert">
      <Section className="grid min-h-[70vh] place-content-center">
        <Container className="grid justify-items-center text-center">
          <h1 className="text-3xl font-bold">We couldn’t load this page</h1>
          <p className="my-4 max-w-xl text-muted">
            Your information is safe. Try the request again, or return later if the problem
            continues.
          </p>
          <Button onPress={reset}>Try again</Button>
        </Container>
      </Section>
    </main>
  )
}
