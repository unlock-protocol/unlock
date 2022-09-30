import React from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ConnectWalletModal } from '../../ConnectWalletModal'
import { Container } from '../../Container'

import { CreateLockSteps } from './CreateLock'

export const CreateLockPage = () => {
  const { network } = useAuth()

  if (!network) {
    return <ConnectWalletModal isOpen={true} setIsOpen={() => void 0} />
  }

  return (
    <div className="min-w-full min-h-screen bg-ui-secondary-200">
      <Container>
        <div className="pt-9">
          <CreateLockSteps />
        </div>
      </Container>
    </div>
  )
}

export default CreateLockPage
