import React, { useState } from 'react'
import type { NextPage } from 'next'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import LockSettingsPage from '~/components/interface/locks/Settings'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { useRouter } from 'next/router'
import { LockPicker } from '~/components/interface/locks/Manage/elements/LockPicker'
import { useAuth } from '~/contexts/AuthenticationContext'

const Create: NextPage = () => {
  const { query } = useRouter()
  const { account: owner } = useAuth()

  const [network, setNetwork] = useState<string>(
    (query?.network as string) ?? ''
  )
  const [lockAddress, setLockAddress] = useState<string>(
    (query?.address as string) ?? ''
  )

  const withoutParams = !lockAddress && !network

  const onLockPick = (lockAddress?: string, network?: string | number) => {
    if (lockAddress && network) {
      setLockAddress(lockAddress)
      setNetwork(`${network}`)
    }
  }

  const LockSelection = () => {
    return (
      <div>
        {withoutParams && (
          <>
            <h2 className="mb-2 text-lg font-bold text-brand-ui-primary">
              Select a lock to start manage it
            </h2>
            <div className="w-1/2">
              <LockPicker owner={owner!} onChange={onLockPick} />
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <BrowserOnly>
      <AppLayout authRequired={true} showHeader={false}>
        <LockSelection />
        {!withoutParams && (
          <LockSettingsPage
            lockAddress={lockAddress! as string}
            network={parseInt((network as string)!, 10)}
          />
        )}
      </AppLayout>
    </BrowserOnly>
  )
}

export default Create
