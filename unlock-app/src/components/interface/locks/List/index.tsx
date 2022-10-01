import { Button } from '@unlock-protocol/ui'
import Link from 'next/link'
import React from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { Container } from '../../Container'
import { ImageBar } from '../Manage/elements/ImageBar'
import { LockList } from './elements/LockList'

const PageHeader = () => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl font-bold">Locks</h1>
      <div>
        <div className="flex flex-col gap-4 md:gap-0 md:justify-between md:flex-row">
          <span className="w-full max-w-lg text-base text-gray-700">
            Create membership for Event ticketing, Media membership, DAO,
            Certification, collectibles and more.
          </span>
          <Link href="/locks/create">
            <Button size="large">Create Lock</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

const WalletNotConnected = () => {
  const loginUrl = `/login?redirect=${encodeURIComponent(window.location.href)}`

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
  const { network } = useAuth()
  const noItems = false

  return (
    <div className="min-w-full min-h-screen bg-ui-secondary-200">
      <Container>
        <div className="pt-9">
          <div className="flex flex-col gap-10">
            <PageHeader />
            {!network ? (
              <WalletNotConnected />
            ) : noItems ? (
              <NoItems />
            ) : (
              <LockList />
            )}
          </div>
        </div>{' '}
      </Container>
    </div>
  )
}

export default LocksListPage
