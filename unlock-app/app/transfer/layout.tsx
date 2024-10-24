import { ReactNode } from 'react'

import TermsOfServiceModal from '~/components/interface/layouts/index/TermsOfServiceModal'
import { Container } from '~/components/interface/Container'
import { ConnectModal } from '~/components/interface/connect/ConnectModal'
import DashboardFooter from '~/components/interface/layouts/index/DashboardFooter'
import DashboardHeader from '~/components/interface/layouts/index/DashboardHeader'

export default function TransferLayout({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden bg-ui-secondary-200">
      <TermsOfServiceModal />
      <Container>
        <ConnectModal />

        <DashboardHeader />
        <div className="flex flex-col gap-10 min-h-screen">{children}</div>

        <DashboardFooter />
      </Container>
    </div>
  )
}
