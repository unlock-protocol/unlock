import React from 'react'
import { Metadata } from 'next'
import { fetchMetadata } from 'frames.js/next'
import { CheckoutPage as CheckoutPageComponent } from '~/components/interface/checkout'
import { getConfig } from '../frames/checkout/components/utils'
import { config as appConfig } from '~/config/app'
import { permanentRedirect } from 'next/navigation'

type Props = {
  searchParams?: Record<string, string | string[] | undefined>
}

const getFirstSearchParam = (
  searchParams: Props['searchParams'],
  key: string
) => {
  const value = searchParams?.[key]
  return Array.isArray(value) ? value[0] : value
}

const getRedirectSearchParams = (searchParams: Props['searchParams']) => {
  const nextSearchParams = new URLSearchParams()

  Object.entries(searchParams || {}).forEach(([key, value]) => {
    if (key === 'id' || value === undefined) {
      return
    }

    const values = Array.isArray(value) ? value : [value]
    values.forEach((item) => {
      nextSearchParams.append(key, item)
    })
  })

  return nextSearchParams.toString()
}

const getCheckoutPath = (
  id: string,
  searchParams: Props['searchParams'] = {}
) => {
  const queryString = getRedirectSearchParams(searchParams)
  const path = `/checkout/${encodeURIComponent(id)}`
  return queryString ? `${path}?${queryString}` : path
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const id = getFirstSearchParam(searchParams, 'id')?.trim()

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
    console.error('Error generating metadata:', error)
    return baseMetadata
  }
}

const CheckoutPage: React.FC<Props> = ({ searchParams }) => {
  const id = getFirstSearchParam(searchParams, 'id')?.trim()

  if (id) {
    permanentRedirect(getCheckoutPath(id, searchParams))
  }

  return <CheckoutPageComponent />
}

export default CheckoutPage
