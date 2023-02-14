import React, { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import LockSettingsPage from '~/components/interface/locks/Settings'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { useRouter } from 'next/router'
import { useAuth } from '~/contexts/AuthenticationContext'
import { Picker } from '~/components/interface/Picker'

export type SettingTab =
  | 'general'
  | 'terms'
  | 'payments'
  | 'roles'
  | 'advanced'
  | 'emails'

const Settings: NextPage = () => {
  const { query } = useRouter()
  const { account: owner } = useAuth()

  const [network, setNetwork] = useState<string>()
  const [lockAddress, setLockAddress] = useState<string>()
  const [defaultTab, setDefaultTab] = useState<SettingTab>('general')

  useEffect(() => {
    setNetwork(query?.network as string)
    setLockAddress(query?.address as string)
    setDefaultTab((query?.defaultTab as SettingTab) ?? 'general')
  }, [query?.network, query?.address, query.defaultTab])

  const withoutParams = query?.address?.length === 0 && !query.network

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
              <Picker
                userAddress={owner!}
                onChange={(state) => {
                  onLockPick(state.lockAddress, state.network)
                }}
              />
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
            defaultTab={defaultTab}
          />
        )}
      </AppLayout>
    </BrowserOnly>
  )
}

export default Settings
