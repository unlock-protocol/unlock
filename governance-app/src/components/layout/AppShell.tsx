// ABOUTME: Top-level app shell wrapping all governance pages.
// Renders GovernanceHeader (wallet connect), content area, and Footer.
'use client'

import { Footer } from '@unlock-protocol/ui'
import { GovernanceHeader } from './GovernanceHeader'
import { ConnectModal } from '~/components/ConnectModal'
import { TermsOfServiceModal } from '~/components/TermsOfServiceModal'

type AppShellProps = {
  children: React.ReactNode
}

const FOOTER_CONFIG = {
  logo: { url: 'https://unlock-protocol.com' },
  privacyUrl: 'https://unlock-protocol.com/privacy',
  termsUrl: 'https://unlock-protocol.com/terms',
  menuSections: [
    {
      title: 'Governance',
      options: [
        {
          label: 'Unlock DAO',
          url: 'https://unlock-protocol.com/blog/unlock-dao',
        },
        { label: 'Forum', url: 'https://unlock.community/' },
        {
          label: 'Snapshot',
          url: 'https://snapshot.org/#/unlock-protocol.eth',
        },
      ],
    },
    {
      title: 'Resources',
      options: [
        { label: 'Docs', url: 'https://docs.unlock-protocol.com/' },
        {
          label: 'Roadmap',
          url: 'https://docs.unlock-protocol.com/governance/roadmap/',
        },
        { label: 'Blog', url: 'https://unlock-protocol.com/blog' },
      ],
    },
  ],
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-ui-secondary-200">
      <TermsOfServiceModal />
      <ConnectModal />
      <GovernanceHeader />
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
      <div className="mx-auto max-w-7xl px-6">
        <Footer {...FOOTER_CONFIG} />
      </div>
    </div>
  )
}
