import React from 'react'
import { Metadata } from 'next'
import { fetchMetadata } from 'frames.js/next'
import { CheckoutPage as CheckoutPageComponent } from '~/components/interface/checkout'
import { config as appConfig } from '~/config/app'
import { getConfig } from '../../frames/checkout/components/utils'
import { getCanonicalCheckoutPath } from '~/utils/checkoutUrl'

type Props = {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = decodeURIComponent(params.id || '').trim()

  const baseMetadata: Metadata = {
    title: 'Checkout | Unlock Protocol',
  }

  if (!id) {
    return baseMetadata
  }

  const canonicalPath = getCanonicalCheckoutPath(id)
  const encodedId = encodeURIComponent(id)

  try {
    const config = await getConfig(id)

    return {
      title: config?.title || baseMetadata.title,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        images: [`/og/checkout?id=${encodedId}`],
      },
      other: {
        ...(await fetchMetadata(
          new URL(`/frames/checkout?id=${encodedId}`, appConfig.unlockApp)
        )),
      },
    }
  } catch (error) {
    console.error(`Error generating checkout metadata for ${id}:`, error)
    return {
      ...baseMetadata,
      alternates: {
        canonical: canonicalPath,
      },
    }
  }
}

const CheckoutPage: React.FC = () => {
  return <CheckoutPageComponent />
}

export default CheckoutPage
