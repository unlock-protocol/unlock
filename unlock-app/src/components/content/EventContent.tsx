import React from 'react'

import Head from 'next/head'
import { pageTitle } from '../../constants'
import { useRouter } from 'next/router'
import { AppLayout } from '../interface/layouts/AppLayout'
import LoadingIcon from '../interface/Loading'
import EventDetails from './event/EventDetails'
import { EventLandingPage } from './event/EventLandingPage'
import { useRouterQueryForLockAddressAndNetworks } from '~/hooks/useRouterQueryForLockAddressAndNetworks'

export const EventContent = () => {
  const { lockAddress, network, isLoading } =
    useRouterQueryForLockAddressAndNetworks()
  return EventContentWithProps({ lockAddress, network, isLoading })
}

interface EventContentWithPropsProps {
  lockAddress: string
  network: number
  isLoading?: boolean
}

export const EventContentWithProps = ({
  lockAddress,
  network,
  isLoading,
}: EventContentWithPropsProps) => {
  const router = useRouter()

  const handleCreateEvent = () => {
    router.push(
      'https://unlock-protocol-1.hubspotpagebuilder.com/unlock-protocol-newsletter-signup-0'
    )
  }

  if (isLoading) {
    return <LoadingIcon />
  }

  const showDetails = lockAddress && network

  return (
    <AppLayout
      showFooter={!showDetails}
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
        <EventDetails lockAddress={lockAddress} network={network} />
      )}
    </AppLayout>
  )
}

export default EventContent
