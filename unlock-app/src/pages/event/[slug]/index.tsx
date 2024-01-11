import { Event, PaywallConfigType } from '@unlock-protocol/core'
import React from 'react'
import { EventContentWithProps } from '~/components/content/EventContent'
import { getServerSidePropsForEventPage } from './shared'

export interface EventPageProps {
  pageProps: {
    event: Event
    checkoutConfig: {
      id?: string
      config: PaywallConfigType
    }
  }
}

export const getServerSideProps = getServerSidePropsForEventPage

const EventPage = (props: EventPageProps) => {
  return <EventContentWithProps {...props.pageProps}></EventContentWithProps>
}

export default EventPage
