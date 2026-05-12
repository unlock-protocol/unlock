import React from 'react'
import { Metadata } from 'next'
import { fetchMetadata } from 'frames.js/next'
import { CheckoutPage as CheckoutPageComponent } from '~/components/interface/checkout'
import { config as appConfig } from '~/config/app'

type Props = {
  params: {
    id: string
  }
}

type CheckoutConfig = {
  title?: string
}

const getCheckoutConfig = async (
  id: string
): Promise<CheckoutConfig | null> => {
  const response = await fetch(`${appConfig.locksmithHost}/v2/checkout/${id}`)

  if (!response.ok) {
    return null
  }

  const { config } = await response.json()
  return config || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id.trim()
  const canonical = `${appConfig.unlockApp}/checkout/${encodeURIComponent(id)}`

  const baseMetadata: Metadata = {
    title: 'Checkout | Unlock Protocol',
    alternates: {
      canonical,
    },
  }

  try {
    const config = await getCheckoutConfig(id)

    if (!config) {
      return baseMetadata
    }

    return {
      title: config.title || baseMetadata.title,
      openGraph: {
        images: [`/og/checkout?id=${encodeURIComponent(id)}`],
      },
      other: {
        ...(await fetchMetadata(
          new URL(
            `/frames/checkout?id=${encodeURIComponent(id)}`,
            appConfig.unlockApp
          )
        )),
      },
      alternates: {
        canonical,
      },
    }
  } catch (error) {
    console.error(`Error generating metadata for checkout config ${id}:`, error)
    return baseMetadata
  }
}

const CheckoutPage: React.FC = () => {
  return <CheckoutPageComponent />
}

export default CheckoutPage
