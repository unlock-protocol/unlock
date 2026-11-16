import { Metadata } from 'next'
import { fetchMetadata } from 'frames.js/next'
import { CheckoutPage as CheckoutPageComponent } from '~/components/interface/checkout'
import { getConfig } from '../../frames/checkout/components/utils'
import { config as appConfig } from '~/config/app'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id
  const encodedId = encodeURIComponent(id)
  const baseMetadata: Metadata = {
    title: 'Checkout | Unlock Protocol',
    alternates: {
      canonical: new URL(
        `/checkout/${encodedId}`,
        appConfig.unlockApp
      ).toString(),
    },
  }

  try {
    const config = await getConfig(id)
    if (!config) {
      return baseMetadata
    }

    return {
      ...baseMetadata,
      title: config.title || baseMetadata.title,
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
    return baseMetadata
  }
}

export default function CheckoutPage({ params }: Props) {
  return <CheckoutPageComponent checkoutId={params.id} />
}
