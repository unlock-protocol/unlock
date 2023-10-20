import React from 'react'

import Head from 'next/head'
import { pageTitle } from '../../constants'
import { useRouter } from 'next/router'
import { AppLayout } from '../interface/layouts/AppLayout'
import LoadingIcon from '../interface/Loading'
import EventDetails from './event/EventDetails'
import { EventLandingPage } from './event/EventLandingPage'
import { useRouterQueryForLockAddressAndNetworks } from '~/hooks/useRouterQueryForLockAddressAndNetworks'
import { useMetadata } from '~/hooks/metadata'

export const EventContent = () => {
  const {
    lockAddress,
    network,
    isLoading: isLoadingQuery,
  } = useRouterQueryForLockAddressAndNetworks()
  const { data: metadata, isInitialLoading: isMetadataLoading } = useMetadata({
    lockAddress,
    network,
  })
  const isLoading = isLoadingQuery || isMetadataLoading
  return EventContentWithProps({ lockAddress, network, isLoading, metadata })
}

interface EventContentWithPropsProps {
  lockAddress: string
  network: number
  metadata?: any
  isLoading?: boolean
}

export const EventContentWithProps = ({
  lockAddress,
  network,
  isLoading,
  metadata,
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

  return (
    <AppLayout
      showFooter={!metadata}
      showLinks={false}
      authRequired={false}
      logoRedirectUrl="/event"
      logoImageUrl="/images/svg/logo-unlock-events.svg"
    >
      <Head>
        <title>{pageTitle('Event')}</title>
      </Head>

      {!metadata && <EventLandingPage handleCreateEvent={handleCreateEvent} />}
      {!!metadata && lockAddress && network && (
        <EventDetails
          metadata={metadata}
          lockAddress={lockAddress}
          network={network}
        />
      )}
    </AppLayout>
  )
}

export default EventContent
