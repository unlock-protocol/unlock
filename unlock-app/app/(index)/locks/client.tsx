'use client'

import React from 'react'
import { Button } from '@unlock-protocol/ui'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useSearchParams } from 'next/navigation'
import { Launcher } from '~/components/interface/Launcher'
import { EnhancedLockList } from '~/components/interface/locks/List/elements/EnhancedLockList'
import { Placeholder } from '@unlock-protocol/ui'
import { WalletNotConnected } from '~/components/interface/layouts/index/WalletNotConnected'

export default function LocksClient() {
  const { account } = useAuthenticate()
  const [showLauncher, setShowLauncher] = React.useState(false)
  const searchParams = useSearchParams()
  const manager = searchParams.get('account')
  const locksOwner = manager ?? account

  const Description = () => {
    return (
      <div className="flex flex-col gap-4 md:gap-0 md:justify-between md:flex-row">
        <span className="w-full max-w-lg text-base text-gray-700">
          A Lock is a membership smart contract you create, deploy, and own on
          Unlock Protocol
        </span>
        {account && (
          <Button
            onClick={() => setShowLauncher(true)}
            className="md:auto"
            size="large"
          >
            Create Lock
          </Button>
        )}
      </div>
    )
  }

  if (showLauncher) {
    return <Launcher />
  }

  if (!locksOwner) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Locks</h1>
        <div className="w-full text-base text-gray-700">
          <Description />
        </div>
        <Placeholder.Root>
          <Placeholder.Card />
          <Placeholder.Card />
          <Placeholder.Card />
          <Placeholder.Card />
          <Placeholder.Card />
          <Placeholder.Card />
        </Placeholder.Root>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Locks</h1>
        <div className="w-full text-base text-gray-700">
          <Description />
        </div>
      </div>
      {!locksOwner ? (
        <WalletNotConnected />
      ) : (
        <EnhancedLockList owner={locksOwner} />
      )}
    </>
  )
}
