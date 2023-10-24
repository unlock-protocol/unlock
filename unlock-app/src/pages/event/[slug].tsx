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
    event?: any // TODO: type this
  }
}

export const getServerSideProps = async ({ params }: Params) => {
  const { data: eventMetadata } = await storage.getEvent(params.slug)
  let locks
  // TODO: consider doing these transformations on the server?
  if (Array.isArray(eventMetadata?.locks)) {
    locks = eventMetadata.locks.reduce((acc: any, lockAsString: any) => {
      const [address, network] = lockAsString.split('-')
      return {
        ...acc,
        [address]: {
          network: parseInt(network),
        },
      }
    }, {})
  }
  return {
    props: {
      event: {
        locks,
        ...toFormData(eventMetadata.data),
      },
    },
  }
}

const EventPage = (props: EventPageProps) => {
  return (
    <EventContentWithProps
      event={props.pageProps.event}
    ></EventContentWithProps>
  )
}

export default EventPage
