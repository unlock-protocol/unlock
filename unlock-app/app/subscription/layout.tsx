import { ReactNode } from 'react'

import TermsOfServiceModal from '~/components/interface/layouts/index/TermsOfServiceModal'
import { Container } from '~/components/interface/Container'
import { ConnectModal } from '~/components/interface/connect/ConnectModal'
import SubscriptionHeader from '~/components/interface/layouts/subscription/SubscriptionHeader'
import DashboardFooter from '~/components/interface/layouts/index/DashboardFooter'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden bg-ui-secondary-200">
      <TermsOfServiceModal />
      <Container>
        <ConnectModal />

        <SubscriptionHeader />
        <div className="flex flex-col gap-10 min-h-screen">{children}</div>

        <DashboardFooter />
      </Container>
    </div>
  )
}
