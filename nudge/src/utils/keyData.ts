import { ethers } from 'ethers'

export default class KeyData {
  provider: ethers.providers.JsonRpcProvider

  constructor(provider: string) {
    this.provider = new ethers.providers.JsonRpcProvider(provider)
  }

  async get(lockAddress: string, tokenId: string) {
    const contract = this.genContract(lockAddress)

    try {
      const owner = await contract.ownerOf(parseInt(tokenId))

      if (owner) {
        const expiration = await contract.keyExpirationTimestampFor(owner)
        return {
          owner,
          expiration: expiration.toNumber(),
        }
      }
      return {}
    } catch (e) {
      return {}
    }
  }

  genContract(lockAddress: string) {
    return new ethers.Contract(
      lockAddress,
      [
        'function ownerOf(uint256 _tokenId) constant view returns (address)',
        'function keyExpirationTimestampFor(address _owner) constant view returns (uint256 timestamp)',
      ],
      this.provider
    )
  }

  openSeaPresentation(data: any) {
    if (data.expiration) {
      return {
        attributes: [
          {
            trait_type: 'Expiration',
            value: data.expiration,
            display_type: 'date',
          },
        ],
      }
    }
    return data
  }
}
