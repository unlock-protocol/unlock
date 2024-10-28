'use client'

import { Launcher } from '../interface/Launcher'
import { useSession } from '~/hooks/useSession'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { Container } from '../interface/Container'
import DashboardHeader from '../interface/layouts/index/DashboardHeader'
import { ConnectModal } from '../interface/connect/ConnectModal'
import LocksContent from './lock/LocksContent'
import { Placeholder } from '@unlock-protocol/ui'

export const HomeContent = () => {
  const { isLoading } = useSession()

  const { account } = useAuthenticate()

  return (
    <Container>
      <ConnectModal />
      <DashboardHeader />
      {isLoading && (
        <Placeholder.Root>
          <Placeholder.Card />
        </Placeholder.Root>
      )}
      {account && (
        <div className="flex flex-col gap-4">
          <LocksContent />
        </div>
      )}
      {!account && !isLoading && <Launcher />}
    </Container>
  )
}
