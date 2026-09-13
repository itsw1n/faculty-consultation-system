import type { StarterStatus as Status } from '../types'

export function StarterStatus({ status }: { status: Status }) {
  return (
    <>
      <h1>{status.heading}</h1>
      <p>Architecture: {status.profile}</p>
    </>
  )
}
