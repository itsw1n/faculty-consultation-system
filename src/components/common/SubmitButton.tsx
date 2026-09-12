'use client'
import { useFormStatus } from 'react-dom'
export function SubmitButton({children,pendingLabel='Submitting…',className}:{children:string;pendingLabel?:string;className?:string}){const{pending}=useFormStatus();return <button type="submit" className={className} disabled={pending} aria-disabled={pending}>{pending?pendingLabel:children}</button>}
