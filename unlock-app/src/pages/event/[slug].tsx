import React from 'react'
import { EventContentWithProps } from '~/components/content/EventContent'
import { storage } from '~/config/storage'
import { toFormData } from '~/components/interface/locks/metadata/utils'

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
  const { data: lockSettings } = await storage.getLockSettingsBySlug(
    params.slug
  )
  if (lockSettings?.network && lockSettings?.lockAddress) {
    const lockMetadataResponse = await storage.lockMetadata(
      lockSettings.network,
      lockSettings.lockAddress
    )

    if (!lockMetadataResponse?.data) {
      throw new Error('Event not found')
    }

    const eventData = toFormData(lockMetadataResponse?.data)

    // What if !eventData ? TODO

    return {
      props: {
        lockAddress: lockSettings?.lockAddress,
        network: lockSettings?.network,
        eventData: eventData,
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
  const { lockAddress, network, eventData } = p.pageProps
  return (
    <EventContentWithProps
      lockAddress={lockAddress}
      network={network}
      eventData={eventData}
    ></EventContentWithProps>
  )
}

export default EventPage
