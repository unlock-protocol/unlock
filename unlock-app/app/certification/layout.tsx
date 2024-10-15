import { ReactNode } from 'react'

import DashboardFooter from '~/components/interface/layouts/index/DashboardFooter'
import TermsOfServiceModal from '~/components/interface/layouts/index/TermsOfServiceModal'
import { Container } from '~/components/interface/Container'
import { ConnectModal } from '~/components/interface/connect/ConnectModal'
import CertificationHeader from '~/components/interface/layouts/certification/CertificationHeader'

export default function CertificationLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden bg-ui-secondary-200">
      <TermsOfServiceModal />
      <Container>
        <ConnectModal />

        <CertificationHeader />

        <div className="flex flex-col gap-10 min-h-screen">{children}</div>

        <DashboardFooter />
      </Container>
    </div>
  )
}
