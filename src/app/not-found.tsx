import Link from 'next/link'
export default function NotFound(){return <main className="route-state"><h1>Page not found</h1><p>The page may have moved or you may not have access to it.</p><Link href="/auth/continue">Return to dashboard</Link></main>}
