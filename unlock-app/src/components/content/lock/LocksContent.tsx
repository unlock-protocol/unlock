'use client'

import React from 'react'

import { Button } from '@unlock-protocol/ui'
import { Launcher } from '~/components/interface/Launcher'
import LocksListPage from '~/components/interface/locks/List'
import { useAuthenticate } from '~/hooks/useAuthenticate'

export default function LocksContent() {
  const { account } = useAuthenticate()
  const [showLauncher, setShowLauncher] = React.useState(false)

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

  return (
    <>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Locks</h1>
        <div className="w-full text-base text-gray-700">
          <Description />
        </div>
      </div>
      <LocksListPage />
    </>
  )
}
