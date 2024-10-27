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
  const id = searchParams.id

  const config = await getConfig(id as string)

  return {
    title: config?.title || 'Checkout | Unlock Protocol',
    openGraph: {
      images: [`/og/checkout?id=${id}`],
    },
    other: {
      ...(await fetchMetadata(
        new URL(`/frames/checkout?id=${id}`, appConfig.unlockApp)
      )),
    },
  }
}

const CheckoutPage: React.FC = () => {
  return <CheckoutPageComponent />
}

export default CheckoutPage
