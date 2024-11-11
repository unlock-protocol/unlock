import React from 'react'
import { Metadata } from 'next'
import { fetchMetadata } from 'frames.js/next'
import { CheckoutPage as CheckoutPageComponent } from '~/components/interface/checkout'
import { getConfig } from '../frames/checkout/components/utils'
import { config as appConfig } from '~/config/app'

type Props = {
  searchParams: { id: string }
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const id = searchParams?.id?.trim()

  // Default metadata without frame data
  const baseMetadata: Metadata = {
    title: 'Checkout | Unlock Protocol',
  }

  // Return base metadata if no valid ID is present
  if (!id || id.length === 0) {
    return baseMetadata
  }

  try {
    const config = await getConfig(id)

    // Return base metadata if config could not be fetched
    if (!config) {
      return baseMetadata
    }

    const metadata: Metadata = {
      title: config.title || baseMetadata.title,
      openGraph: {
        images: [`/og/checkout?id=${id}`],
      },
      other: {
        ...(await fetchMetadata(
          new URL(`/frames/checkout?id=${id}`, appConfig.unlockApp)
        )),
      },
    }

    return metadata
  } catch (error) {
    console.error('Error generating metadata:', error)
    return baseMetadata
  }
}

const CheckoutPage: React.FC = () => {
  return <CheckoutPageComponent />
}

export default CheckoutPage
