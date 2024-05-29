import React from 'react'
import type { NextPage } from 'next'
import LocksListPage from '~/components/interface/locks/List'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { Button } from '@unlock-protocol/ui'
import { useAuth } from '~/contexts/AuthenticationContext'
import { Launcher } from '~/components/interface/Launcher'
import { useRouter } from 'next/router'
import { NextAuthAccount } from '~/components/interface/connect/NextAuthAccount'

const Locks: NextPage = () => {
  const { account } = useAuth()
  const [showLauncher, setShowLauncher] = React.useState(false)

  console.log('Account', account)

  const router = useRouter()
  const nexthAuthValue = router.query.nextAuth as string
  console.log('NextAuth', nexthAuthValue)
  const useNextAuth = nexthAuthValue === 'true'

  const Description = () => {
    return (
      <div className="flex flex-col gap-4 md:gap-0 md:justify-between md:flex-row">
        {useNextAuth && <NextAuthAccount />}
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
    return (
      <AppLayout authRequired={false} showLinks={false}>
        <Launcher />
      </AppLayout>
    )
  }
  return (
    <AppLayout title="Locks" description={<Description />}>
      <LocksListPage />
    </AppLayout>
  )
}

export default Locks
