import { ethers } from 'ethers'

export default class LockData {
  provider: ethers.Provider

  constructor(provider: string) {
    this.provider = new ethers.JsonRpcProvider(provider)
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
