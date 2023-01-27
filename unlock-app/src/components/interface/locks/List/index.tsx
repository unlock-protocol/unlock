import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ImageBar } from '../Manage/elements/ImageBar'
import { LockList } from './elements/LockList'

const WalletNotConnected = () => {
  const [loginUrl, setLoginUrl] = useState<string>('')
  useEffect(() => {
    setLoginUrl(`/login?redirect=${encodeURIComponent(window.location.href)}`)
  }, [])

  return (
    <ImageBar
      src="/images/illustrations/wallet-not-connected.svg"
      description={
        <>
          <span>
            Wallet is not connected yet.{' '}
            <Link href={loginUrl}>
              <span className="cursor-pointer text-brand-ui-primary">
                Connect it now
              </span>
            </Link>
          </span>
        </>
      }
    />
  )
}

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
