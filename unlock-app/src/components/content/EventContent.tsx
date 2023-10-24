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
import { toFormData } from '~/components/interface/locks/metadata/utils'

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
  const eventData = metadata ? toFormData(metadata) : null
  const isLoading = isLoadingQuery || isMetadataLoading

  // GREAT: TODO LET US REBUILD THE eventData

  return EventContentWithProps({ isLoading, eventData })
}

interface EventContentWithPropsProps {
  event: any // TODO: type this
  isLoading?: boolean
}

export const EventContentWithProps = ({
  isLoading,
  event,
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
      showFooter={!event}
      showLinks={false}
      authRequired={false}
      logoRedirectUrl="/event"
      logoImageUrl="/images/svg/logo-unlock-events.svg"
    >
      <Head>
        <title>{pageTitle('Event')}</title>
      </Head>

      {!event && <EventLandingPage handleCreateEvent={handleCreateEvent} />}
      {!!event && <EventDetails event={event} />}
    </AppLayout>
  )
}

export default EventContent
