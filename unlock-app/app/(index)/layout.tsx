import React, { ReactNode } from 'react'

import DashboardHeader from '~/components/interface/layouts/index/DashboardHeader'
import DashboardFooter from '~/components/interface/layouts/index/DashboardFooter'
import TermsOfServiceModal from '~/components/interface/layouts/index/TermsOfServiceModal'
import { Container } from '~/components/interface/Container'
import { ConnectModal } from '~/components/interface/connect/ConnectModal'

export default function DashboardLayout({ children }: { children: ReactNode }) {
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
