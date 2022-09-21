import { useRouter } from 'next/router'
import React from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ConnectWalletModal } from '../../ConnectWalletModal'
import { LockDetailCard } from './elements/LockDetailCard'
import { Members } from './elements/Members'
import { TotalBar } from './elements/TotalBar'

const ActionBar = () => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xl font-bold">Members</span>
    </div>
  )
}

export const ManageLockPage = () => {
  const { network: walletNetwork } = useAuth()
  const { query } = useRouter()

  const { address, network } = query ?? {}

  if (!walletNetwork) {
    return <ConnectWalletModal isOpen={true} setIsOpen={() => void 0} />
  }

  const lockNetwork = parseInt(network as string)
  const lockAddress = address as string

  return (
    <div className="min-h-screen bg-ui-secondary-200 pb-60">
      <div className="w-full px-4 lg:px-40">
        <div className="px-4 mx-auto lg:container pt-9">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-14">
            <div className="lg:col-span-3">
              <LockDetailCard lockAddress={lockAddress} network={lockNetwork} />
            </div>
            <div className="flex flex-col gap-6 lg:col-span-9">
              <TotalBar lockAddress={lockAddress} network={lockNetwork} />
              <ActionBar />
              <Members lockAddress={lockAddress} network={lockNetwork} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageLockPage
