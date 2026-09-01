import React from 'react'
import { Metadata } from 'next'
import { CheckoutPage as CheckoutPageComponent } from '~/components/interface/checkout'
import { getConfig } from '../../frames/checkout/components/utils'
import { config as appConfig } from '~/config/app'

type Props = {
  params: { id: string }
}

const getCanonicalCheckoutUrl = (id: string) => {
  return `${appConfig.unlockApp}/checkout/${encodeURIComponent(id)}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params?.id?.trim()
  const baseMetadata: Metadata = {
    title: 'Checkout | Unlock Protocol',
    alternates: id
      ? {
          canonical: getCanonicalCheckoutUrl(id),
        }
      : undefined,
  }

  if (!id) {
    return baseMetadata
  }

  try {
    const config = await getConfig(id)

    if (!config) {
      return baseMetadata
    }

    return {
      title: config.title || baseMetadata.title,
      openGraph: {
        images: [`/og/checkout?id=${id}`],
      },
      other: {
        'fc:frame': 'vNext',
        'fc:frame:image': `${appConfig.unlockApp}/og/checkout?id=${id}`,
        'fc:frame:post_url': `${appConfig.unlockApp}/frames/checkout?id=${id}`,
      },
      alternates: {
        canonical: getCanonicalCheckoutUrl(id),
      },
    }
  } catch (error) {
    console.error(
      `Error generating metadata for checkout config '${id}':`,
      error
    )
    return baseMetadata
  }
}

const CheckoutPage: React.FC = () => {
  return <CheckoutPageComponent />
}

export default CheckoutPage
