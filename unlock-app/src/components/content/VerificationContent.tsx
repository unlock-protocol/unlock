import Head from 'next/head'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import { getMembershipVerificationConfig } from '~/utils/verification'
import { pageTitle } from '../../constants'
import LocksContext from '../../contexts/LocksContext'
import { AppLayout } from '../interface/layouts/AppLayout'
import { Scanner } from '../interface/verification/Scanner'
import VerificationStatus from '../interface/VerificationStatus'

export const VerificationContent: React.FC<unknown> = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [locks, setLocks] = useState({})

  const membershipVerificationConfig = getMembershipVerificationConfig({
    data: searchParams.get('data'),
    sig: searchParams.get('sig'),
  })

  if (!membershipVerificationConfig) {
    return (
      <AppLayout title="Verification" showLinks={false} authRequired={false}>
        <Head>
          <title>{pageTitle('Verification')}</title>
        </Head>
        <main>
          <Scanner />
        </main>
      </AppLayout>
    )
  }

  const addLock = (lock: any) => {
    return setLocks({
      ...locks,
      [lock.address]: lock,
    })
  }

  return (
    <AppLayout title="Verification" showLinks={false} authRequired={false}>
      <Head>
        <title>{pageTitle('Verification')}</title>
      </Head>
      <LocksContext.Provider
        value={{
          locks,
          addLock,
        }}
      >
        <VerificationStatus
          config={membershipVerificationConfig}
          onVerified={() => {
            router.push('/verification')
          }}
        />
      </LocksContext.Provider>
    </AppLayout>
  )
}

export default VerificationContent
