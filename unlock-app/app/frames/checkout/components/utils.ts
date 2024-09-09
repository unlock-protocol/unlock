import { Web3Service } from '@unlock-protocol/unlock-js'
import { locksmith } from '../../../../src/config/locksmith'
import networks from '@unlock-protocol/networks'

export async function getLockDataFromCheckout(id: string) {
  const { config } = await fetch(
    `https://locksmith.unlock-protocol.com/v2/checkout/${id}`
  ).then((res) => res.json())

  const locks = config.locks
  const lockAddress = Object.keys(locks)[0]
  const { name, network } = locks[lockAddress]

  const { data } = await locksmith.lockMetadata(network, lockAddress)
  const { image, description } = data

  const web3Service = new Web3Service(networks)
  const res = await web3Service.getLock(lockAddress, network)
  const price = `${res.keyPrice} ${res.currencySymbol}`

  const lock = {
    name,
    address: lockAddress,
    network,
    image,
    description,
    price,
  }

  return lock
}
