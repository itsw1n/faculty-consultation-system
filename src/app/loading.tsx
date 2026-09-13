export default function Loading() {
  return <main className="grid min-h-[70vh] place-content-center justify-items-center p-8 text-center" aria-busy="true" aria-live="polite"><div className="size-10 animate-spin rounded-full border-5 border-border border-t-primary motion-reduce:animate-none" aria-hidden="true"/><h1 className="mt-4 text-2xl font-bold">Loading CampusConnect</h1><p className="mt-2 text-muted">Please wait while we prepare this page.</p></main>
}
