import { PaywallConfigType } from '@unlock-protocol/core'
import { isValidPaywallConfig } from './checkoutValidators'
import { ReadonlyURLSearchParams } from 'next/navigation'

/**
 * Extracts and validates the PaywallConfig from the query parameters.
 *
 * This utility handles two types of input:
 * 1. A full PaywallConfig object passed as a JSON string in the 'paywallConfig' parameter.
 * 2. A simplified configuration using 'lock', 'title', and 'network' parameters.
 *
 * It performs the following steps:
 * 1. Normalizes the input to a consistent object format.
 * 2. Attempts to parse and validate a full PaywallConfig if present.
 * 3. Constructs a simple PaywallConfig from individual parameters if no full config is found.
 * 4. Validates the resulting configuration.
 *
 * @param query - The URL query parameters as a Record<string, any> or ReadonlyURLSearchParams
 * @returns The validated PaywallConfigType or undefined if invalid
 */
export function getPaywallConfigFromQuery(
  query: Record<string, any> | ReadonlyURLSearchParams
): PaywallConfigType | undefined {
  let queryObj: Record<string, any> = {}

  // Convert ReadonlyURLSearchParams to Record<string, any> if necessary
  if (query instanceof URLSearchParams) {
    query.forEach((value, key) => {
      // If the key already exists, convert the value to an array
      if (queryObj[key]) {
        if (Array.isArray(queryObj[key])) {
          queryObj[key].push(value)
        } else {
          queryObj[key] = [queryObj[key], value]
        }
      } else {
        queryObj[key] = value
      }
    })
  } else {
    queryObj = query
  }

  // Attempt to parse and validate a full PaywallConfig
  if (typeof queryObj.paywallConfig === 'string') {
    const rawConfig = queryObj.paywallConfig
    const decodedConfig = rawConfig

    let parsedConfig: any

    try {
      parsedConfig = JSON.parse(decodedConfig)
      // Use nullish coalescing operator to preserve null values
      parsedConfig.minRecipients = parsedConfig?.minRecipients ?? 1
      parsedConfig.maxRecipients = parsedConfig?.maxRecipients ?? 1
    } catch (e) {
      return undefined
    }

    if (isValidPaywallConfig(parsedConfig)) {
      return parsedConfig as PaywallConfigType
    }
    return undefined
  }

  // Construct a simple PaywallConfig from individual parameters
  if (typeof queryObj.lock === 'string') {
    const lock = queryObj.lock
    const title = queryObj.title || 'Unlock Protocol'
    const network = Number(queryObj.network)

    return {
      title,
      network,
      locks: {
        [lock]: {},
      },
    }
  }

  // No valid configuration found
  return undefined
}
