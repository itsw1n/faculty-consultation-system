import Image from 'next/image'
import { CalendarClock, MessageCircle, ShieldCheck } from 'lucide-react'
import logo from '@/assets/acd-logo.png'
import { SignInForm } from '@/features/auth/components/SignInForm'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'

export default function HomePage() {
  return (
    <main
      data-ui="login"
      className="grid min-h-screen bg-surface md:grid-cols-[0.92fr_1.08fr] [&_input]:font-normal"
    >
      <Section
        className="flex flex-col justify-center py-6 md:py-16 lg:py-20"
        aria-labelledby="welcome-title"
      >
        <Container className="flex h-full max-w-2xl flex-col justify-center px-5 sm:px-8 md:px-12 lg:px-14">
          <p className="text-[0.68rem] font-bold tracking-[0.16em] text-primary uppercase">
            A stronger academic community
          </p>
          <h1
            id="welcome-title"
            className="my-3 max-w-xl text-2xl leading-[1.1] font-semibold tracking-tight sm:text-4xl md:text-5xl lg:text-[4.4rem]"
          >
            Welcome to <span className="block text-accent-hover">Assumption College of Davao</span>
          </h1>
          <p className="hidden text-base font-semibold text-primary md:block">
            Connect. Consult. Create progress.
          </p>
          <p className="mt-3 hidden max-w-xl text-base leading-relaxed text-muted md:block">
            Schedule consultations, seek guidance, and build a more connected academic community.
          </p>
          <ul
            className="mt-8 hidden list-none flex-col gap-3 p-0 text-sm font-semibold text-primary md:flex md:flex-col lg:flex-row lg:gap-6"
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
          <blockquote className="mt-12 hidden max-w-xl border-t border-border pt-5 text-sm text-muted md:mt-16 md:block">
            <p className="font-serif italic">“Education thrives when conversations happen.”</p>
            <cite className="mt-2 block text-xs font-semibold not-italic text-primary">
              — Our academic belief
            </cite>
          </blockquote>
        </Container>
      </Section>
      <Section
        className="relative flex min-h-0 flex-col overflow-hidden bg-primary py-6 text-white md:min-h-screen md:py-20"
        aria-labelledby="signin-title"
      >
        <div
          className="pointer-events-none absolute hidden md:block top-[-10rem] right-[-9rem] w-[32rem] sm:right-[-11rem] sm:w-[40rem] md:right-[-16rem] md:w-[48rem] lg:right-[-18rem] lg:w-[56rem]"
          aria-hidden="true"
        >
          <Image
            src={logo}
            alt=""
            width={484}
            height={474}
            unoptimized
            loading="eager"
            className="h-auto w-full opacity-10"
          />
        </div>
        <Container className="relative flex h-full max-w-2xl flex-1 flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-md rounded-xl border border-white/15 bg-surface p-5 text-foreground shadow-dialog sm:p-9">
            <div className="flex items-center gap-3 border-b border-border pb-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-subtle">
                <Image
                  src={logo}
                  alt=""
                  width={24}
                  height={24}
                  unoptimized
                  loading="eager"
                  className="size-6 object-contain"
                />
              </span>
              <p className="text-base leading-tight font-semibold">
                <span className="block">Faculty Consultation &amp;</span>
                <span className="block">Scheduling</span>
              </p>
            </div>
            <h2 id="signin-title" className="mt-6 text-2xl font-semibold tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Sign in to manage your consultations and schedules.
            </p>
            <SignInForm />
          </div>
        </Container>
      </Section>
    </main>
  )
}
