import { useRouter } from 'next/router'
import React from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ConnectWalletModal } from '../../ConnectWalletModal'
import { LockDetailCard } from './elements/LockDetailCard'
import { TotalBar } from './elements/TotalBar'

export const ManageLockPage = () => {
  const { network } = useAuth()
  const { query } = useRouter()

  const { address: lockAddress } = query ?? {}

  if (!network) {
    return <ConnectWalletModal isOpen={true} setIsOpen={() => void 0} />
  }

  return (
    <div className="min-h-screen bg-ui-secondary-200">
      <div className="w-full px-4 md:px-40">
        <div className="px-4 mx-auto md:container pt-9">
          <div className="flex flex-col md:grid md:grid-cols-12 gap-14">
            <div className="md:col-span-3">
              <LockDetailCard
                lockAddress={lockAddress as string}
                network={network}
              />
            </div>
            <div className="md:col-span-9">
              <TotalBar lockAddress={lockAddress as string} network={network} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageLockPage
