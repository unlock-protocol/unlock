import { ethers } from 'ethers'

export default class LockData {
  provider: ethers.providers.JsonRpcProvider

  constructor(provider: string) {
    this.provider = new ethers.providers.JsonRpcProvider(provider)
  }

  async owner(address: string) {
    const lock = new ethers.Contract(
      address,
      ['function owner() constant view returns (address)'],
      this.provider
    )

    return await lock.owner()
  }

  async getHasValidKey(lockAddress: string, keyHolder: string) {
    const lock = new ethers.Contract(
      lockAddress,
      ['function getHasValidKey(address _owner) constant view returns (bool)'],
      this.provider
    )

    try {
      return await lock.getHasValidKey(keyHolder)
    } catch (e) {
      return false
    }
  }

  async getKeyOwner(lockAddress: string, tokenId: number): Promise<string> {
    const lock = new ethers.Contract(
      lockAddress,
      ['function ownerOf(uint256 _tokenId) constant view returns (address)'],
      this.provider
    )

    return await lock.ownerOf(tokenId)
  }
}
