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
  }
}

export const getServerSideProps = async ({ params }: Params) => {
  const response = await storage.getLockSettingsBySlug(params.slug)
  return {
    props: response.data,
  }
}

const EventPage = (p: EventPageProps) => {
  const { lockAddress, network } = p.pageProps
  return (
    <EventContentWithProps
      lockAddress={lockAddress}
      network={network}
    ></EventContentWithProps>
  )
}

export default EventPage
