// ABOUTME: Top-level app shell wrapping all governance pages.
// Renders GovernanceHeader (with wallet connect) and a centered content area.
import { GovernanceHeader } from './GovernanceHeader'

type AppShellProps = {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-ui-secondary-200">
      <GovernanceHeader />
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  )
}
