import { networks } from '@unlock-protocol/networks'
import { NetworkConfig } from '@unlock-protocol/types'
import { useEffect, useState } from 'react'
import { useProvider } from '~/hooks/useProvider'

/**
 * A helper function that retruns the list of featured networks, or the one the user
 * is connected to if supported by Unlock!
 * @param all
 * @returns
 */
export const useAvailableNetworks = (all = false) => {
  const { getWalletService, account } = useProvider()

  const networkOptions = Object.values<NetworkConfig>(networks || {})
    ?.filter(({ featured }: NetworkConfig) => all || !!featured)
    .map(({ name, id }: NetworkConfig) => {
      return {
        label: name,
        value: id,
      }
    })

  const [availableNetworks, setAvailableNetworks] =
    useState<{ label: string; value: number }[]>(networkOptions)

  useEffect(() => {
    const filterNetworksForUser = async () => {
      // TODO: find a better way to identify if the user is connected to a network
      if (account) {
        const walletService = await getWalletService()
        const { chainId: network } =
          await walletService.signer.provider.getNetwork()
        // Add the user's network if it's suppported by Unlock (but not already featured)
        if (network && networks[network] && !networks[network].featured) {
          networkOptions.unshift({
            label: networks[network].name,
            value: networks[network].id,
          })
        }
        setAvailableNetworks(
          networkOptions.sort((a, b) =>
            a.value === network ? -1 : b.value === network ? 1 : 0
          )
        )
      }
    }
    filterNetworksForUser()
  }, [account])

  return availableNetworks
}
