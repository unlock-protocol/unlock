import { useRouter } from 'next/router'
import React from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { WalletNotConnected } from '../../layouts/AppLayout'
import { LockList } from './elements/LockList'

export const LocksListPage = () => {
  const { network, account } = useAuth()
  const { query } = useRouter()
  const { account: manager } = query

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
