import { Event, PaywallConfigType } from '@unlock-protocol/core'
import React from 'react'
import { EventContentWithProps } from '~/components/content/EventContent'
import { toFormData } from '~/components/interface/locks/metadata/utils'
import { storage } from '~/config/storage'

interface Params {
  params: {
    slug: string
  }
}

interface EventPageProps {
  pageProps: {
    event: Event
    checkoutConfig: {
      id?: string
      config: PaywallConfigType
    }
  }
}

export const getServerSideProps = async ({ params }: Params) => {
  const { data: eventMetadata } = await storage.getEvent(params.slug)
  return {
    props: {
      event: {
        ...toFormData(eventMetadata.data!),
      },
      checkoutConfig: eventMetadata.checkoutConfig,
    },
  }
}

const EventPage = (props: EventPageProps) => {
  return <EventContentWithProps {...props.pageProps}></EventContentWithProps>
}

export default EventPage
