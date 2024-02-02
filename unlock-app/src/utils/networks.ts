import { networks } from '@unlock-protocol/networks'

import { NetworkConfig } from '@unlock-protocol/types'
import { useAuth } from '~/contexts/AuthenticationContext'

/**
 * A helper function that retruns the list of featured networks, or the one the user
 * is connected to if supported by Unlock!
 * @param all
 * @returns
 */
export const useAvailableNetworks = (all = false) => {
  const { network } = useAuth()

  const networkOptions = Object.values<NetworkConfig>(networks || {})
    ?.filter(({ featured }: NetworkConfig) => all || !!featured)
    .map(({ name, id }: NetworkConfig) => {
      return {
        label: name,
        value: id,
      }
    })

  // Add the user's network if it's suppported by Unlock (but not already featured)
  if (networks[network!] && !networks[network!].featured) {
    networkOptions.unshift({
      label: networks[network!].name,
      value: networks[network!].id,
    })
  }

  return networkOptions
}
