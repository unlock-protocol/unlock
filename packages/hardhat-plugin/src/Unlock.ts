/* eslint-disable class-methods-use-this */

import networks from '@unlock-protocol/networks'
// import contracts from '@unlock-protocol/contracts'
import { NetworkConfigs } from '@unlock-protocol/types'
import { NetworksConfig } from 'hardhat/types'

export class UnlockHRE {
  networks: NetworkConfigs

  constructor(availableNetworks: NetworksConfig) {
    this.networks = Object.keys(availableNetworks)
      .map((netName) => availableNetworks[netName])
      .filter(({ chainId }) => chainId)
      .reduce((acc, { chainId }) => {
        if (chainId !== undefined) {
          return {
            ...acc,
            [chainId]: networks[chainId],
          }
        }
        return acc
      }, {})
  }

  // public getChainId = async () => {
  //   return await hre.network.provider.send('eth_chainId')
  // }

  public deployLock() {
    console.log('lets deploy')
    return 'hello'
  }
}
