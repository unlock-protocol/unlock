import { PaywallConfigType, PaywallLockConfigType } from '@unlock-protocol/core'
interface FetchRecipientsDataOptions {
  recipients: string[]
  network: number
  lockAddress: string
}

export async function fetchRecipientsData(
  url: string,
  { lockAddress, network, recipients }: FetchRecipientsDataOptions
) {
  try {
    const result: string[] = []
    for (const recipient of recipients) {
      const dataEndpoint = new URL(url)

      dataEndpoint.searchParams.append('network', network.toString())
      dataEndpoint.searchParams.append('lockAddress', lockAddress)
      dataEndpoint.searchParams.append('recipient', recipient)

      // We need to proxy to avoid cors.
      const endpoint = new URL('/data', 'https://rpc.unlock-protocol.com')
      endpoint.searchParams.append('url', dataEndpoint.toString())

      const abortController = new AbortController()

      const timer = setTimeout(() => {
        abortController.abort()
      }, 5000)

      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        signal: abortController.signal,
      })

      clearTimeout(timer)

      if (!response.ok) {
        throw new Error('Failed to fetch data.')
      }

      const json = await response.json()
      result.push(json.data)
      return result
    }
  } catch (error) {
    console.error(error)
    return
  }
}

export function formatFiatPriceFromCents(priceInCents: number, currency = '$') {
  const formatted = (priceInCents / 100).toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })
  return `${formatted} ${currency}`
}
interface Options {
  paywallConfig?: PaywallConfigType
  lock?: PaywallLockConfigType
}

export const shouldSkip = ({ lock, paywallConfig }: Options) => {
  const maxRecipients = lock?.maxRecipients || paywallConfig?.maxRecipients
  const minRecipients = lock?.minRecipients || paywallConfig?.minRecipients
  const hasMaxRecipients = maxRecipients && maxRecipients > 1
  const hasMinRecipients = minRecipients && minRecipients > 1
  const skipQuantity = !(hasMaxRecipients || hasMinRecipients)

  const skip = lock?.skipRecipient || paywallConfig?.skipRecipient
  const collectsMetadadata =
    lock?.metadataInputs ||
    paywallConfig?.metadataInputs ||
    paywallConfig?.emailRequired ||
    lock?.emailRequired
  const skipRecipient = Boolean(skip && !collectsMetadadata)

  return {
    skipQuantity,
    skipRecipient,
  }
}
