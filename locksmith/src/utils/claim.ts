import { ethers } from 'ethers'
import { getWeb3Service } from '../initializers'

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
  const web3Service = getWeb3Service()
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

  const totalAmount = prices.reduce<ethers.BigNumberish>(
    (a, b) => a + b,
    BigInt(0)
  )
  return totalAmount
}
