'use client'
import { Button, Input, Label, SearchField } from 'react-aria-components'

export function SearchInput({label,value,onChange,placeholder='Search'}:{label:string;value:string;onChange:(value:string)=>void;placeholder?:string}) {
  return <SearchField className="grid flex-1 gap-1.5 text-xs font-bold" value={value} onChange={onChange}><Label>{label}</Label><div className="relative"><Input className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 pr-10 outline-none focus-visible:ring-3 focus-visible:ring-focus" placeholder={placeholder}/>{value&&<Button className="absolute top-1/2 right-1 min-h-9 -translate-y-1/2 rounded-md px-3 text-muted hover:bg-subtle focus-visible:outline-3 focus-visible:outline-focus" aria-label="Clear search">×</Button>}</div></SearchField>
}
