import React from 'react'
import { Metadata } from 'next'
import { fetchMetadata } from 'frames.js/next'
import { CheckoutPage as CheckoutPageComponent } from '~/components/interface/checkout'
import { getConfig } from '../frames/checkout/components/utils'
import { config as appConfig } from '~/config/app'
import { permanentRedirect } from 'next/navigation'

type Props = {
  searchParams: Record<string, string | string[] | undefined>
}

const getSearchParam = (
  searchParams: Props['searchParams'],
  key: string
): string | undefined => {
  const value = searchParams?.[key]
  return Array.isArray(value) ? value[0] : value
}

const getPathCheckoutUrl = (
  id: string,
  searchParams: Props['searchParams']
) => {
  const remainingParams = new URLSearchParams()

  Object.entries(searchParams || {}).forEach(([key, value]) => {
    if (key === 'id' || value === undefined) {
      return
    }

    const values = Array.isArray(value) ? value : [value]
    values.forEach((item) => remainingParams.append(key, item))
  })

  const queryString = remainingParams.toString()
  const path = `/checkout/${encodeURIComponent(id)}`
  return queryString ? `${path}?${queryString}` : path
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const id = getSearchParam(searchParams, 'id')?.trim()

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
      alternates: {
        canonical: `${appConfig.unlockApp}/checkout/${encodeURIComponent(id)}`,
      },
    }

    return metadata
  } catch (error) {
    console.error(
      `Error generating metadata for checkout config '${id}':`,
      error
    )
    return baseMetadata
  }
}

const CheckoutPage: React.FC<Props> = ({ searchParams }) => {
  const id = getSearchParam(searchParams, 'id')?.trim()

  if (id) {
    permanentRedirect(getPathCheckoutUrl(id, searchParams))
  }

  return <CheckoutPageComponent />
}

export default CheckoutPage
