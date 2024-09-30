'use client'

import { useSearchParams } from 'next/navigation'

import { useAuth } from '~/contexts/AuthenticationContext'

import { WalletNotConnected } from '../../layouts/AppLayout'

import { LockList } from './elements/LockList'

import { Placeholder } from '@unlock-protocol/ui'

export const LocksListPage = () => {
  const { network, account } = useAuth()

  const searchParams = useSearchParams()

  const manager = searchParams.get('account')

  // show lock for the specific manager if present in query parameters and ensure account is defined before using it

  const locksOwner = manager ?? account

  if (!network || !locksOwner) {
    return (
      <Placeholder.Root>
        <Placeholder.Card />
        <Placeholder.Card />
        <Placeholder.Card />
        <Placeholder.Card />
        <Placeholder.Card />
        <Placeholder.Card />
      </Placeholder.Root>
    )
  }

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
