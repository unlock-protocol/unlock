import React from 'react'
import { EventContentWithProps } from '~/components/content/EventContent'
import { storage } from '~/config/storage'

interface Params {
  params: {
    slug: string
  }
}

interface EventPageProps {
  pageProps: {
    lockAddress: string
    network: number
    eventData?: any
  }
}

export const getServerSideProps = async ({ params }: Params) => {
  const { data: event } = await storage.getEvent(params.slug)
  return event
}

const EventPage = (p: EventPageProps) => {
  const { eventData } = p.pageProps
  return <EventContentWithProps eventData={eventData}></EventContentWithProps>
}

export default EventPage
