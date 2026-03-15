import Link from 'next/link'
import { governanceConfig, governanceRoutes } from '~/config/governance'

type AppShellProps = {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-ui-secondary-200">
      <header className="border-b border-brand-ui-primary/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-ui-primary/60">
              Unlock DAO
            </p>
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold text-brand-ui-primary">
                Governance App Foundation
              </h1>
              <p className="max-w-2xl text-sm text-brand-ui-primary/70">
                Initial app shell for the future `vote.unlock-protocol.com`
                deployment on Base.
              </p>
            </div>
          </div>
          <div className="grid gap-2 rounded-3xl border border-brand-ui-primary/10 bg-ui-secondary-200 p-4 text-sm text-brand-ui-primary/70">
            <span>
              Governor:{' '}
              <span className="font-mono">
                {governanceConfig.governorAddress}
              </span>
            </span>
            <span>
              Timelock:{' '}
              <span className="font-mono">
                {governanceConfig.timelockAddress}
              </span>
            </span>
            <span>
              Token:{' '}
              <span className="font-mono">{governanceConfig.tokenAddress}</span>
            </span>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl flex-wrap gap-2 px-6 pb-6">
          {governanceRoutes.map((route) => (
            <Link
              key={route.href}
              className="rounded-full border border-brand-ui-primary/10 bg-white px-4 py-2 text-sm font-medium text-brand-ui-primary transition hover:border-brand-ui-primary/30"
              href={route.href}
            >
              {route.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  )
}
