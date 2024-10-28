'use client'

import { useEffect, useState } from 'react'
import LockSettingsPage from '~/components/interface/locks/Settings'
import { useSearchParams } from 'next/navigation'
import { Picker } from '~/components/interface/Picker'
import { useAuthenticate } from '~/hooks/useAuthenticate'

export type SettingTab =
  | 'general'
  | 'terms'
  | 'payments'
  | 'roles'
  | 'advanced'
  | 'emails'
  | 'verifiers'
  | 'checkout'
  | 'referrals'

const LocksSettingsContent = () => {
  const searchParams = useSearchParams()
  const { account: owner } = useAuthenticate()

  const [network, setNetwork] = useState<string>()
  const [lockAddress, setLockAddress] = useState<string>()
  const [defaultTab, setDefaultTab] = useState<SettingTab>('general')

  useEffect(() => {
    setNetwork(searchParams.get('network') || undefined)
    setLockAddress(searchParams.get('address') || undefined)
    setDefaultTab((searchParams.get('defaultTab') as SettingTab) ?? 'general')
  }, [searchParams])

  const withoutParams = !lockAddress || !network

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
              Select a lock to manage it
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
    <>
      <LockSelection />
      {!withoutParams && lockAddress && network && (
        <LockSettingsPage
          lockAddress={lockAddress}
          network={parseInt(network, 10)}
          defaultTab={defaultTab}
        />
      )}
    </>
  )
}

export default LocksSettingsContent
