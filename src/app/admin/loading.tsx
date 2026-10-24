export default function AdminLoading() {
  return (
    <section aria-busy="true" aria-label="Loading administration workspace" className="space-y-6">
      <p role="status" className="text-sm text-muted">
        Loading your workspace…
      </p>
      <div aria-hidden="true" className="space-y-6 motion-safe:animate-pulse">
        <div className="h-7 w-48 rounded-md bg-border" />
        <div className="h-24 rounded-xl border border-border bg-surface" />
        <div className="divide-y divide-border rounded-xl border border-border bg-surface p-5">
          {[1, 2, 3].map((row) => (
            <div key={row} className="flex items-center justify-between gap-4 py-5">
              <div className="h-4 w-1/2 rounded bg-subtle" />
              <div className="h-9 w-20 rounded-md bg-subtle" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
