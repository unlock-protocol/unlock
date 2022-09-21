import React from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ConnectWalletModal } from '../../ConnectWalletModal'

import { CreateLockSteps } from './CreateLock'

export const CreateLockPage = () => {
  const { network } = useAuth()

  if (!network) {
    return <ConnectWalletModal isOpen={true} setIsOpen={() => void 0} />
  }

  return (
    <div className="min-w-full min-h-screen bg-ui-secondary-200">
      <div className="px-4 mx-auto lg:container pt-9">
        <CreateLockSteps />
      </div>
    </div>
  )
}

export default CreateLockPage
