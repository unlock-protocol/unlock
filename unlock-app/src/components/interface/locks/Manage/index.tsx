import { Button } from '@unlock-protocol/ui'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ConnectWalletModal } from '../../ConnectWalletModal'
import { LockDetailCard } from './elements/LockDetailCard'
import { Members } from './elements/Members'
import { TotalBar } from './elements/TotalBar'
import { FiKey as KeyIcon } from 'react-icons/fi'
import GrantKeysDrawer from '~/components/creator/members/GrantKeysDrawer'

interface ActionBarProps {
  lockAddress: string
}

const ActionBar = ({ lockAddress }: ActionBarProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <GrantKeysDrawer
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        lockAddresses={[lockAddress]}
      />
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-brand-ui-primary">Members</span>
        <div className="flex gap-2">
          <Button
            variant="outlined-primary"
            size="small"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-2">
              <KeyIcon className="text-brand-ui-primary" size={16} />
              <span className="text-brand-ui-primary">Airdrop Keys</span>
            </div>
          </Button>
        </div>
      </div>
    </>
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
              <ActionBar lockAddress={lockAddress} />
              <Members lockAddress={lockAddress} network={lockNetwork} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageLockPage
