import { signInWithGoogle } from '@/features/auth/actions'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'

export default function HomePage() {
  return (
    <main
      data-ui="login"
      className="grid min-h-screen bg-linear-to-br from-surface to-subtle md:grid-cols-[1fr_1.2fr]"
    >
      <Section
        className="flex flex-col justify-center py-12 md:py-20"
        aria-labelledby="welcome-title"
      >
        <Container className="max-w-2xl px-8 md:px-12">
          <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">
            A stronger academic community
          </p>
          <h1
            id="welcome-title"
            className="my-3 text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl"
          >
            Welcome to <span className="block text-accent-hover">CampusConnect</span>
          </h1>
          <p className="font-bold">Connect. Consult. Create progress.</p>
          <p className="mt-2 text-muted">
            Schedule consultations, seek guidance, and build a more connected academic community.
          </p>
          <ul
            className="mt-8 flex list-none flex-col gap-2 p-0 text-sm font-semibold sm:flex-row sm:gap-6"
            aria-label="Benefits"
          >
            <li>Better discussions</li>
            <li>Easier scheduling</li>
            <li>A stronger community</li>
          </ul>
        </Container>
      </Section>
      <Section
        className="flex min-h-[32rem] flex-col bg-linear-to-br from-primary/80 to-primary py-12 text-white md:min-h-screen md:py-20"
        aria-labelledby="signin-title"
      >
        <Container className="flex h-full max-w-2xl flex-1 flex-col justify-between px-8 md:px-12">
          <div>
            <p
              className="grid size-12 place-items-center rounded-xl border-2 border-white font-extrabold"
              aria-hidden="true"
            >
              CC
            </p>
            <p className="mt-3 text-2xl font-extrabold">CampusConnect</p>
            <p>Faculty Consultation &amp; Scheduling System</p>
          </div>
          <div className="mx-auto w-full max-w-lg rounded-xl bg-surface/95 p-8 text-foreground shadow-card">
            <h2 id="signin-title" className="text-2xl font-bold">
              One account. A more connected campus.
            </h2>
            <p className="mt-3 text-muted">
              Use your school Google account to sign in securely and get started.
            </p>
            <form className="mt-6" action={signInWithGoogle}>
              <button
                className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-accent px-4 py-3 font-bold text-white hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                type="submit"
              >
                <span className="mr-3 rounded bg-white px-2 py-1 text-accent" aria-hidden="true">
                  G
                </span>{' '}
                Sign in with Google
              </button>
            </form>
          </div>
        </Container>
      </Section>
    </main>
  )
}
