'use client'

import { useSearchParams } from 'next/navigation'
import { LockList } from './elements/LockList'
import { Placeholder } from '@unlock-protocol/ui'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { WalletNotConnected } from '../../layouts/index/WalletNotConnected'

export const LocksListPage = () => {
  const { account } = useAuthenticate()

  const searchParams = useSearchParams()

  const manager = searchParams.get('account')

  // show lock for the specific manager if present in query parameters and ensure account is defined before using it
  const locksOwner = manager ?? account

  if (!locksOwner) {
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
      {!locksOwner ? (
        <WalletNotConnected />
      ) : (
        <LockList owner={locksOwner as string} />
      )}
    </>
  )
}

export default LocksListPage
