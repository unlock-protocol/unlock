import { useSearchParams } from 'next/navigation'
import React from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { WalletNotConnected } from '../../layouts/AppLayout'
import { LockList } from './elements/LockList'

export const LocksListPage = () => {
  const { network, account } = useAuth()
  const searchParams = useSearchParams()
  const manager = searchParams.get('account')

  // show lock for the specific manager if present in query parameters
  const locksOwner = manager ?? account!

  return (
    <>
      {!network ? (
        <WalletNotConnected />
      ) : (
        <LockList owner={locksOwner as string} />
      )}
    </>
  )
}

export default LocksListPage
