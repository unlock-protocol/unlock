import { Web3Service } from '@unlock-protocol/unlock-js'
import { networks } from '@unlock-protocol/networks'

const web3Service = new Web3Service(networks)

export const getProvider = (network: number) => {
  return web3Service.providerForNetwork(network)
}
