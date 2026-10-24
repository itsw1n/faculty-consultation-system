'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type PasswordFieldProps = {
  id: string
  name: string
  label: string
  autoComplete: string
  placeholder?: string
  minLength?: number
}

export function PasswordField({
  id,
  name,
  label,
  autoComplete,
  placeholder = '********',
  minLength,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="grid gap-1.5 text-sm font-semibold">
      <label htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          id={id}
          className="min-h-12 w-full rounded-md border border-border bg-surface px-3 pr-11 text-sm outline-none transition focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-focus"
          name={name}
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          minLength={minLength}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          aria-label={`${showPassword ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
          className="absolute top-1/2 right-0.5 grid size-11 -translate-y-1/2 place-items-center rounded-md text-muted transition hover:text-foreground focus-visible:ring-3 focus-visible:ring-focus"
        >
          {showPassword ? (
            <EyeOff size={18} aria-hidden="true" />
          ) : (
            <Eye size={18} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  )
}
