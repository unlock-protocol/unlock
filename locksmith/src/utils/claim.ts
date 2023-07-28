import { Web3Service } from '@unlock-protocol/unlock-js'
import { networks } from '@unlock-protocol/networks'
import { ethers } from 'ethers'

interface Options {
  recipients: string[]
  data?: (string | null)[]
  lockAddress: string
  network: number
}

export const getTotalPurchasePriceInCrypto = async ({
  recipients,
  network,
  data,
  lockAddress,
}: Options) => {
  const web3Service = new Web3Service(networks)
  const prices = await Promise.all(
    recipients.map((recipient, index) => {
      return web3Service.purchasePriceFor({
        lockAddress,
        userAddress: recipient,
        network,
        data: data?.[index] || '0x',
        referrer: recipient,
      })
    })
  )

  const totalAmount = prices.reduce<ethers.BigNumber>(
    (a, b) => a.add(b),
    ethers.BigNumber.from(0)
  )
  return totalAmount
}
