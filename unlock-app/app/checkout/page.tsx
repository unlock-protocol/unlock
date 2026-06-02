import React from 'react'
import { Metadata } from 'next'
import { fetchMetadata } from 'frames.js/next'
import { permanentRedirect } from 'next/navigation'
import { CheckoutPage as CheckoutPageComponent } from '~/components/interface/checkout'
import { getConfig } from '../frames/checkout/components/utils'
import { config as appConfig } from '~/config/app'
import { getCanonicalCheckoutPath } from '~/utils/checkoutUrl'

type SearchParamValue = string | string[] | undefined
type Props = {
  searchParams?: Record<string, SearchParamValue>
}

const getFirstSearchParam = (
  searchParams: Props['searchParams'],
  key: string
) => {
  const value = searchParams?.[key]
  return Array.isArray(value) ? value[0] : value
}

const getQueryStringWithoutId = (searchParams: Props['searchParams']) => {
  const params = new URLSearchParams()

  Object.entries(searchParams || {}).forEach(([key, value]) => {
    if (key === 'id' || value === undefined) {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry))
    } else {
      params.append(key, value)
    }
  })

  return params.toString()
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const id = getFirstSearchParam(searchParams, 'id')?.trim()

  const baseMetadata: Metadata = {
    title: 'Checkout | Unlock Protocol',
  }

  if (!id || id.length === 0) {
    return baseMetadata
  }

  const canonicalPath = getCanonicalCheckoutPath(id)
  const encodedId = encodeURIComponent(id)

  try {
    const config = await getConfig(id)

    if (!config) {
      return {
        ...baseMetadata,
        alternates: {
          canonical: canonicalPath,
        },
      }
    }

    const metadata: Metadata = {
      title: config.title || baseMetadata.title,
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

    return metadata
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      ...baseMetadata,
      alternates: {
        canonical: canonicalPath,
      },
    }
  }
}

const CheckoutPage: React.FC<Props> = ({ searchParams }) => {
  const id = getFirstSearchParam(searchParams, 'id')?.trim()

  if (id) {
    const query = getQueryStringWithoutId(searchParams)
    permanentRedirect(
      `${getCanonicalCheckoutPath(id)}${query ? `?${query}` : ''}`
    )
  }

  return <CheckoutPageComponent />
}

export default CheckoutPage
