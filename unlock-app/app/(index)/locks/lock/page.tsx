'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import { ManageLockContent } from '~/components/interface/locks/Manage'
import { useAuthenticate } from '~/hooks/useAuthenticate'

const ManageLockPage: React.FC = () => {
  const { account: owner } = useAuthenticate()
  const searchParams = useSearchParams()

  // Extract search params
  const network = (searchParams.get('network') as string) || ''
  const lockAddress = (searchParams.get('address') as string) || ''

  if (!owner) {
    return <div>Loading...</div>
  }

  return (
    <ManageLockContent
      owner={owner}
      network={network}
      lockAddress={lockAddress}
    />
  )
}

export default ManageLockPage
