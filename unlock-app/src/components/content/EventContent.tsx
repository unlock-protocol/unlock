import React from 'react'

import Head from 'next/head'
import { pageTitle } from '../../constants'
import { useRouter } from 'next/router'
import { AppLayout } from '../interface/layouts/AppLayout'
import LoadingIcon from '../interface/Loading'
import EventDetails from './event/EventDetails'
import { EventLandingPage } from './event/EventLandingPage'
import { useRouterQueryForLockAddressAndNetworks } from '~/hooks/useRouter'

export const EventContent = () => {
  const router = useRouter()

  const { isLoading, lockAddress, network } =
    useRouterQueryForLockAddressAndNetworks()

  const handleCreateEvent = () => {
    router.push('/event/new')
  }

  if (!lockAddress && network) {
    return <LoadingIcon />
  }

  const showDetails = lockAddress && network

  return (
    <AppLayout
      showLinks={false}
      authRequired={false}
      logoRedirectUrl="/event"
      logoImageUrl="/images/svg/logo-unlock-events.svg"
    >
      <Head>
        <title>{pageTitle('Event')}</title>
      </Head>
      {!showDetails && (
        <EventLandingPage handleCreateEvent={handleCreateEvent} />
      )}
      {showDetails && lockAddress && network && (
        <EventDetails
          lockAddress={lockAddress}
          network={network}
          isLoading={isLoading}
        />
      )}
    </AppLayout>
  )
}

export default EventContent
