'use client'
import { Button,Input,Label,SearchField } from 'react-aria-components'
export function SearchInput({label,value,onChange,placeholder='Search'}:{label:string;value:string;onChange:(value:string)=>void;placeholder?:string}){return <SearchField value={value} onChange={onChange}><Label>{label}</Label><div><Input placeholder={placeholder}/>{value&&<Button aria-label="Clear search">×</Button>}</div></SearchField>}
