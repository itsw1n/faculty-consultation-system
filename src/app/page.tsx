import { signInWithGoogle } from '@/features/auth/actions'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { CalendarClock, MessageCircle, ShieldCheck } from 'lucide-react'

export default function HomePage() {
  return (
    <main
      data-ui="login"
      className="grid min-h-screen bg-linear-to-br from-surface via-surface to-subtle md:grid-cols-[0.92fr_1.08fr]"
    >
      <Section
        className="flex flex-col justify-center py-12 md:py-16 lg:py-20"
        aria-labelledby="welcome-title"
      >
        <Container className="flex h-full max-w-2xl flex-col justify-center px-8 md:px-12 lg:px-14">
          <p className="text-[0.68rem] font-bold tracking-[0.16em] text-primary uppercase">
            A stronger academic community
          </p>
          <h1
            id="welcome-title"
            className="my-3 max-w-xl text-4xl leading-[1.05] font-bold tracking-tight sm:text-5xl lg:text-[4.4rem]"
          >
            Welcome to <span className="block text-accent-hover">Assumption College of Davao</span>
          </h1>
          <p className="text-base font-bold text-primary sm:text-lg">
            Connect. Consult. Create progress.
          </p>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Schedule consultations, seek guidance, and build a more connected academic community.
          </p>
          <ul
            className="mt-8 flex list-none flex-col gap-3 p-0 text-sm font-semibold text-primary sm:flex-row sm:gap-6"
            aria-label="Benefits"
          >
            <li className="flex items-center gap-2">
              <MessageCircle size={16} className="text-accent" aria-hidden="true" />
              Better discussions
            </li>
            <li className="flex items-center gap-2">
              <CalendarClock size={16} className="text-accent" aria-hidden="true" />
              Easier scheduling
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-accent" aria-hidden="true" />A stronger
              community
            </li>
          </ul>
          <blockquote className="mt-12 max-w-xl rounded-xl border border-border/80 bg-white/65 px-5 py-4 text-sm text-muted shadow-sm sm:mt-16">
            <p className="font-serif italic">“Education thrives when conversations happen.”</p>
            <cite className="mt-2 block text-xs font-semibold not-italic text-primary">
              — Our academic belief
            </cite>
          </blockquote>
        </Container>
      </Section>
      <Section
        className="relative flex min-h-[38rem] flex-col overflow-hidden bg-linear-to-br from-[#3c6190] via-primary to-[#0b356c] py-12 text-white md:min-h-screen md:py-20"
        aria-labelledby="signin-title"
      >
        <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true">
          <div className="absolute -top-24 right-[-8rem] size-[28rem] rounded-full border-[3rem] border-white/10" />
          <div className="absolute bottom-[-12rem] left-[-8rem] size-[30rem] rounded-full border-[4rem] border-blue-200/10" />
          <div className="absolute top-1/3 right-1/4 h-px w-72 rotate-[-28deg] bg-white/25" />
        </div>
        <Container className="relative flex h-full max-w-2xl flex-1 flex-col px-8 md:px-12 lg:px-16">
          <div className="md:pt-1">
            <p
              className="grid size-14 place-items-center rounded-xl border-2 border-white/90 text-lg font-extrabold"
              aria-hidden="true"
            >
              ACD
            </p>
            <p className="mt-4 text-2xl font-extrabold sm:text-3xl">Assumption College of Davao</p>
            <p className="mt-1 text-base text-blue-50 sm:text-lg">
              Faculty Consultation &amp; Scheduling System
            </p>
          </div>
          <div className="mx-auto mt-16 w-full max-w-lg rounded-2xl bg-surface/95 p-7 text-foreground shadow-dialog sm:mt-auto sm:mb-10 sm:p-9">
            <h2 id="signin-title" className="max-w-md text-2xl leading-tight font-bold sm:text-3xl">
              One account. A more connected campus.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
              Use your school Google account to sign in securely and get started.
            </p>
            <form className="mt-7" action={signInWithGoogle}>
              <button
                className="inline-flex min-h-13 w-full items-center justify-center rounded-lg bg-accent px-4 py-3 font-bold text-white shadow-sm transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                type="submit"
              >
                <span
                  className="mr-3 grid size-7 place-items-center rounded bg-white text-sm font-extrabold text-accent"
                  aria-hidden="true"
                >
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
