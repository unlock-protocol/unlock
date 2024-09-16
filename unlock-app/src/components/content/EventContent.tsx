'use client'
import LoadingIcon from '../interface/Loading'
import EventDetails from './event/EventDetails'
import { EventLandingPage } from './event/EventLandingPage'
import { useRouterQueryForLockAddressAndNetworks } from '~/hooks/useRouterQueryForLockAddressAndNetworks'
import { useMetadata } from '~/hooks/metadata'
import { toFormData } from '~/components/interface/locks/metadata/utils'
import { Event, PaywallConfigType } from '@unlock-protocol/core'
import { defaultEventCheckoutConfigForLockOnNetwork } from './event/NewEvent'
import { useRouter } from 'next/navigation'

export const EventContent = () => {
  const {
    lockAddress,
    network,
    isLoading: isLoadingQuery,
  } = useRouterQueryForLockAddressAndNetworks()
  const { data: metadata, isLoading: isMetadataLoading } = useMetadata({
    lockAddress,
    network,
  })
  const event = metadata ? (toFormData(metadata) as Event) : undefined
  const isLoading = isLoadingQuery || isMetadataLoading

  // Create a checkout config if none is set
  const checkoutConfig = {
    config: defaultEventCheckoutConfigForLockOnNetwork(lockAddress, network),
  }
  return EventContentWithProps({ isLoading, checkoutConfig, event })
}

interface EventContentWithPropsProps {
  event?: Event
  isLoading?: boolean
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

export const EventContentWithProps = ({
  isLoading,
  checkoutConfig,
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
    <>
      {!event && <EventLandingPage handleCreateEvent={handleCreateEvent} />}
      {!!event && (
        <EventDetails event={event} checkoutConfig={checkoutConfig} />
      )}
    </>
  )
}

export default EventContent
