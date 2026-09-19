'use client'

import {
  Button,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  SelectValue,
} from 'react-aria-components'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/cn'

export type SelectOption = {
  id: string
  label: string
  isDisabled?: boolean
}

type SelectProps = {
  label?: string
  ariaLabel?: string
  options: SelectOption[]
  value?: string
  defaultValue?: string
  placeholder?: string
  name?: string
  onChange?: (value: string) => void
  isDisabled?: boolean
  isRequired?: boolean
  className?: string
}

export function Select({
  label,
  ariaLabel,
  options,
  value,
  defaultValue,
  placeholder,
  name,
  onChange,
  isDisabled = false,
  isRequired = false,
  className,
}: SelectProps) {
  return (
    <div className={cn('grid flex-1 gap-1.5 text-xs font-bold', className)}>
      {label ? <Label>{label}</Label> : null}
      <AriaSelect
        selectedKey={value}
        defaultSelectedKey={defaultValue}
        onSelectionChange={(key) => onChange?.(String(key))}
        name={name}
        isDisabled={isDisabled}
        isRequired={isRequired}
        placeholder={placeholder}
        aria-label={label ?? ariaLabel}
        className="min-w-0"
      >
        {({ isOpen }) => (
          <>
            <Button className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-focus data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50">
              <SelectValue className="flex-1 truncate data-[placeholder]:text-muted" />
              {isOpen ? (
                <ChevronUp size={18} aria-hidden="true" className="shrink-0 text-muted" />
              ) : (
                <ChevronDown size={18} aria-hidden="true" className="shrink-0 text-muted" />
              )}
            </Button>
            <Popover className="z-[60] w-[var(--trigger-width)] overflow-hidden rounded-lg border border-border bg-surface shadow-dialog">
              <ListBox className="max-h-64 overflow-y-auto p-1 font-normal outline-none">
                {options.map((option) => (
                  <ListBoxItem
                    key={option.id}
                    id={option.id}
                    textValue={option.label}
                    isDisabled={option.isDisabled}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[focused]:bg-subtle data-[selected]:font-bold"
                  >
                    {({ isSelected }) => (
                      <>
                        <span className="flex-1 truncate">{option.label}</span>
                        {isSelected ? (
                          <Check size={16} aria-hidden="true" className="shrink-0 text-accent" />
                        ) : null}
                      </>
                    )}
                  </ListBoxItem>
                ))}
              </ListBox>
            </Popover>
          </>
        )}
      </AriaSelect>
    </div>
  )
}
