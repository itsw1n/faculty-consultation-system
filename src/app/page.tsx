import { StarterStatus } from '@/features/status/components/StarterStatus'
import { getStarterStatus } from '@/features/status/services/getStarterStatus'

export default function HomePage() {
  const status = getStarterStatus()
  return <main><p>create-win-project</p><StarterStatus status={status} /><p>{"designed for school system"}</p><p>Read <code>AGENTS.md</code> before your first agent-assisted change.</p></main>
}
