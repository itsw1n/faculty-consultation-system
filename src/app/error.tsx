'use client'

import { Button } from '@/components/common/Button'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-[70vh] place-content-center justify-items-center p-8 text-center" role="alert"><h1 className="text-3xl font-bold">We couldn’t load this page</h1><p className="my-4 max-w-xl text-muted">Your information is safe. Try the request again, or return later if the problem continues.</p><Button onPress={reset}>Try again</Button></main>
}
