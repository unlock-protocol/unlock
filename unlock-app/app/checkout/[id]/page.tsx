import React from 'react'
import { Metadata } from 'next'
import { fetchMetadata } from 'frames.js/next'
import { CheckoutPage as CheckoutPageComponent } from '~/components/interface/checkout'
import { getConfig } from '../../frames/checkout/components/utils'
import { config as appConfig } from '~/config/app'
import { getCheckoutPath, isCheckoutId } from '~/utils/checkoutPath'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params?.id?.trim()

  // Default metadata without frame data
  const baseMetadata: Metadata = {
    title: 'Checkout | Unlock Protocol',
  }

  // Do not call locksmith or the frames route for ids that cannot be a saved
  // checkout config.
  if (!isCheckoutId(id)) {
    return baseMetadata
  }

  try {
    // The frame metadata does not depend on the config, so fetch both at once.
    // A failure of the frame request must not break the page metadata.
    const [config, frameMetadata] = await Promise.all([
      getConfig(id),
      fetchMetadata(
        new URL(
          `/frames/checkout?id=${encodeURIComponent(id)}`,
          appConfig.unlockApp
        )
      ).catch((error) => {
        console.error(
          `Error fetching frame metadata for config id '${id}':`,
          error
        )
        return {}
      }),
    ])

    // Return base metadata if config could not be fetched
    if (!config) {
      console.warn(`Checkout config not found for id '${id}'`)
      return baseMetadata
    }

    return {
      title: config.title || baseMetadata.title,
      openGraph: {
        images: [`/og/checkout?id=${encodeURIComponent(id)}`],
      },
      // `/checkout?id=<id>` redirects here: this is the canonical URL.
      alternates: {
        canonical: new URL(getCheckoutPath(id), appConfig.unlockApp).toString(),
      },
      other: {
        ...frameMetadata,
      },
    }
  } catch (error) {
    console.error(`Error generating metadata for config id '${id}':`, error)
    return baseMetadata
  }
}

const CheckoutPage: React.FC<Props> = ({ params }) => {
  return <CheckoutPageComponent id={params.id?.trim()} />
}

export default CheckoutPage
