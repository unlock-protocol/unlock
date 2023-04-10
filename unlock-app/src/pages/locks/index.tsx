import React from 'react'
import type { NextPage } from 'next'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import LocksListPage from '~/components/interface/locks/List'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { Button } from '@unlock-protocol/ui'
import Link from 'next/link'
import { useAuth } from '~/contexts/AuthenticationContext'

const Locks: NextPage = () => {
  const { account } = useAuth()

  const Description = () => {
    return (
      <div className="flex flex-col gap-4 md:gap-0 md:justify-between md:flex-row">
        <span className="w-full max-w-lg text-base text-gray-700">
          A Lock is a smart contract you create, deploy, and own on Unlock
          Protocol
        </span>
        {account && (
          <Link href="/locks/create">
            <Button className="w-full md:auto" size="large">
              Create Lock
            </Button>
          </Link>
        )}
      </div>
    )
  }
  return (
    <BrowserOnly>
      <AppLayout title="Locks" description={<Description />}>
        <LocksListPage />
      </AppLayout>
    </BrowserOnly>
  )
}

export default Locks
