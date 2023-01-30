import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { WalletNotConnected } from '../../layouts/AppLayout'
import { ImageBar } from '../Manage/elements/ImageBar'
import { LockList } from './elements/LockList'

const NoItems = () => {
  return (
    <ImageBar
      src="/images/illustrations/no-locks.svg"
      description={
        <>
          <span>
            You haven’t create any Locks yet.{' '}
            <Link href="/locks/create">
              <span className="cursor-pointer text-brand-ui-primary">
                Get started.
              </span>
            </Link>
          </span>
        </>
      }
    />
  )
}

export const LocksListPage = () => {
  const { network, account } = useAuth()
  const { query } = useRouter()
  const { account: manager } = query

  const noItems = false

  // show lock for the specific manager if present in query parameters
  const locksOwner = manager ?? account!

  return (
    <>
      {!network ? (
        <WalletNotConnected />
      ) : noItems ? (
        <NoItems />
      ) : (
        <LockList owner={locksOwner as string} />
      )}
    </>
  )
}

export default LocksListPage
