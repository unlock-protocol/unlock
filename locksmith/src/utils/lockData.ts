import { ethers } from 'ethers'

export default class LockData {
  provider: ethers.providers.JsonRpcProvider

  constructor(provider: string) {
    this.provider = new ethers.providers.JsonRpcProvider(provider)
  }

  async owner(address: string) {
    let lock = new ethers.Contract(
      address,
      ['function owner() constant view returns (address)'],
      this.provider
    )

    return await lock.owner()
  }
}
