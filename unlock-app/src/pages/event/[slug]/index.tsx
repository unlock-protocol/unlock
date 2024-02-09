import { Event, PaywallConfigType } from '@unlock-protocol/core'
import React from 'react'
import { EventContentWithProps } from '~/components/content/EventContent'

import { toFormData } from '~/components/interface/locks/metadata/utils'
import { storage } from '~/config/storage'

export interface ServerSidePropsParams {
  params: {
    slug: string
  }
}

export const getServerSidePropsForEventPage = async (slug: string) => {
  const { data: eventMetadata } = await storage
    .getEvent(slug)
    .catch((error) => {
      console.error(error)
      return { data: null }
    })
  if (!eventMetadata) {
    return {
      notFound: true,
    }
  }
  return {
    props: {
      event: {
        ...toFormData({
          ...eventMetadata.data!,
          slug: eventMetadata.slug,
        }),
      },
      checkoutConfig: eventMetadata.checkoutConfig,
    },
  }
}

export const getServerSideProps = async ({ params }: ServerSidePropsParams) => {
  return getServerSidePropsForEventPage(params.slug)
}

export interface EventPageProps {
  pageProps: {
    event: Event
    checkoutConfig: {
      id?: string
      config: PaywallConfigType
    }
  }
}

const EventPage = (props: EventPageProps) => {
  return <EventContentWithProps {...props.pageProps}></EventContentWithProps>
}

export default EventPage
