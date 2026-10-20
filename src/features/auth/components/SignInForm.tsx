'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { SubmitButton } from '@/components/common/SubmitButton'
import { initialActionState } from '@/lib/actionState'
import { signInWithPassword } from '../actions'

const fieldClass = 'grid gap-1.5 text-sm font-semibold'
const controlClass =
  'min-h-12 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-focus'

export function SignInForm() {
  const [state, formAction] = useActionState(signInWithPassword, initialActionState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={formAction} className="mt-6 grid gap-4">
      <label className={fieldClass} htmlFor="email">
        School email
        <input
          id="email"
          className={controlClass}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@acdeducation.com"
          required
        />
      </label>
      <div className={fieldClass}>
        <label htmlFor="password">Password</label>
        <div className="relative">
          <input
            id="password"
            className={`${controlClass} pr-11`}
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="********"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted transition hover:text-foreground focus-visible:ring-3 focus-visible:ring-focus"
          >
            {showPassword ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      <div className="-mt-1 flex justify-end">
        <Link
          className="text-sm font-semibold text-primary hover:underline"
          href="/auth/forgot-password"
        >
          Forgot password?
        </Link>
      </div>
      {state.error ? (
        <p className="text-sm font-semibold text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      <SubmitButton pendingLabel="Signing in…" className="mt-2">
        Sign in →
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link className="font-semibold text-primary hover:underline" href="/auth/sign-up">
          Create account
        </Link>
      </p>
    </form>
  )
}
