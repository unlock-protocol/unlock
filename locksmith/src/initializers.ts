import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'

const globalAny: any = global

export const getWeb3Service = () => {
  if (globalAny.web3Service && 'test' !== process.env?.NODE_ENV) {
    return globalAny.web3Service
  } else {
    globalAny.web3Service = new Web3Service(networks)
    return globalAny.web3Service
  }
}
