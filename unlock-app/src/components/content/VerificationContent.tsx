import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { getMembershipVerificationConfig } from '~/utils/verification'
import { pageTitle } from '../../constants'
import LocksContext from '../../contexts/LocksContext'
import { AppLayout } from '../interface/layouts/AppLayout'
import { Scanner } from '../interface/verification/Scanner'
import VerificationStatus from '../interface/VerificationStatus'

export const VerificationContent: React.FC<unknown> = () => {
  const { query } = useRouter()
  const [locks, setLocks] = useState({})
  const router = useRouter()

  const membershipVerificationConfig = getMembershipVerificationConfig({
    data: query.data?.toString(),
    sig: query.sig?.toString(),
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
