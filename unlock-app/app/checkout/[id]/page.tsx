import React from 'react'
import { Metadata } from 'next'
import { CheckoutPage as CheckoutPageComponent } from '~/components/interface/checkout'
import { getConfig } from '../../frames/checkout/components/utils'
import { config as appConfig } from '~/config/app'
import { notFound } from 'next/navigation'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params?.id?.trim()

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
        'fc:frame': 'vNext',
        'fc:frame:image': `${appConfig.unlockApp}/og/checkout?id=${id}`,
        'fc:frame:post_url': `${appConfig.unlockApp}/frames/checkout?id=${id}`,
        // we can add more frame meta tags here if needed
      },
      alternates: {
        canonical: `${appConfig.unlockApp}/checkout/${id}`,
      },
    }

    return metadata
  } catch (error) {
    console.error(`Error generating metadata for config id '${id}':`, error)
    return baseMetadata
  }
}

const CheckoutPage: React.FC<Props> = ({ params }) => {
  const { id } = params

  // Validate the ID format (basic UUID validation)
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    notFound()
  }

  return <CheckoutPageComponent />
}

export default CheckoutPage
