'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import { getMembershipVerificationConfig } from '~/utils/verification'
import LocksContext from '../../contexts/LocksContext'
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
      <main>
        <Scanner />
      </main>
    )
  }

  const addLock = (lock: any) => {
    return setLocks({
      ...locks,
      [lock.address]: lock,
    })
  }

  return (
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
  )
}

export default VerificationContent
