import { useRouter } from 'next/router'
import React from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ConnectWalletModal } from '../../ConnectWalletModal'
import { LockDetailCard } from './elements/LockDetailCard'
import { TotalBar } from './elements/TotalBar'

export const ManageLockPage = () => {
  const { network } = useAuth()
  const { query } = useRouter()

  const { address: lockAddress, network: lockNetwork } = query ?? {}

  if (!network) {
    return <ConnectWalletModal isOpen={true} setIsOpen={() => void 0} />
  }

  return (
    <div className="min-h-screen bg-ui-secondary-200">
      <div className="w-full px-4 lg:px-40">
        <div className="px-4 mx-auto lg:container pt-9">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-14">
            <div className="lg:col-span-3">
              <LockDetailCard
                lockAddress={lockAddress as string}
                network={parseInt(lockNetwork as string)}
              />
            </div>
            <div className="lg:col-span-9">
              <TotalBar
                lockAddress={lockAddress as string}
                network={parseInt(lockNetwork as string)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageLockPage
