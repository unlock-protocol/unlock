'use client'

import TermsOfServiceModal from '~/components/interface/layouts/index/TermsOfServiceModal'
import DashboardHeader from '~/components/interface/layouts/index/DashboardHeader'
import { ConnectModal } from '~/components/interface/connect/ConnectModal'
import { Container } from '~/components/interface/Container'
import DashboardFooter from '~/components/interface/layouts/index/DashboardFooter'
import { usePathname } from 'next/navigation'

// Paths that shouldn't be wrapped in the default layout
const UNWRAPPED_PATHS = ['/checkout', '/demo', '/google-sign-in']

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Determine if the current path should bypass the default layout
  const shouldUnwrap = UNWRAPPED_PATHS.some((path) =>
    pathname?.startsWith(path)
  )

  return (
    <>
      {shouldUnwrap ? (
        // Render children without the default layout
        children
      ) : (
        // Render children within the default layout
        <div className="overflow-hidden bg-ui-secondary-200">
          <TermsOfServiceModal />
          <Container>
            <ConnectModal />
            <DashboardHeader />

            <div className="flex flex-col gap-10 min-h-screen">{children}</div>

            <DashboardFooter />
          </Container>
        </div>
      )}
    </>
  )
}
