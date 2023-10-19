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
    metadata?: any
  }
}

export const getServerSideProps = async ({ params }: Params) => {
  const { data: lockSettings } = await storage.getLockSettingsBySlug(
    params.slug
  )
  if (lockSettings?.network && lockSettings?.lockAddress) {
    const lockMetadataResponse = await storage.lockMetadata(
      lockSettings.network,
      lockSettings.lockAddress
    )
    return {
      props: {
        lockAddress: lockSettings?.lockAddress,
        network: lockSettings?.network,
        metadata: lockMetadataResponse?.data,
      },
    }
  }

  return {
    props: {
      lockAddress: lockSettings?.lockAddress,
      network: lockSettings?.network,
    },
  }
}

const EventPage = (p: EventPageProps) => {
  const { lockAddress, network, metadata } = p.pageProps
  return (
    <EventContentWithProps
      lockAddress={lockAddress}
      network={network}
      metadata={metadata}
    ></EventContentWithProps>
  )
}

export default EventPage
