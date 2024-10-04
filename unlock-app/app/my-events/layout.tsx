import { ReactNode } from 'react'

import TermsOfServiceModal from '~/components/interface/layouts/index/TermsOfServiceModal'
import { Container } from '~/components/interface/Container'
import { ConnectModal } from '~/components/interface/connect/ConnectModal'
import EventHeader from '~/components/interface/layouts/event/EventHeader'
import EventFooter from '~/components/interface/layouts/event/EventFooter'
import { AuthRequired } from 'app/Components/ProtectedContent'

export default function MyEventsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden bg-ui-secondary-200">
      <TermsOfServiceModal />
      <Container>
        <ConnectModal />

        <EventHeader />
        <div className="flex flex-col gap-10 min-h-screen">
          <AuthRequired>{children}</AuthRequired>
        </div>

        <EventFooter />
      </Container>
    </div>
  )
}
