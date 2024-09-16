'use client'

import { useRouter } from 'next/navigation'
import LoadingIcon from '../interface/Loading'
import EventDetails from './event/EventDetails'
import { EventLandingPage } from './event/EventLandingPage'
import { Event, PaywallConfigType } from '@unlock-protocol/core'

interface EventContentWithPropsProps {
  event?: Event
  isLoading?: boolean
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

export const EventContentWithProps = ({
  isLoading = false,
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
      {event && <EventDetails event={event} checkoutConfig={checkoutConfig} />}
    </>
  )
}

export default EventContentWithProps
