export function PageHeading({ title, description }: { title: string; description: string }) {
  return (
    <header>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-2 mb-8 text-muted">{description}</p>
    </header>
  )
}
