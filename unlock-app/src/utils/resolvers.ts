import { Web3Service } from '@unlock-protocol/unlock-js'
import { config as AppConfig } from '~/config/app'

export const onResolveName = async (address: string) => {
  if (address.length === 0) return
  const web3Service = new Web3Service(AppConfig.networks)
  return await web3Service.resolveName(address)
}
