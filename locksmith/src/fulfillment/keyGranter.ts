import { ethers } from 'ethers'

export class KeyGranter {
  credentials: string

  provider: any

  constructor(credentials: string, host: string) {
    this.credentials = credentials
    this.provider = new ethers.providers.JsonRpcProvider(host)
  }

  async grantKeys(lockAddress: string, recipient: string) {
    const wallet = new ethers.Wallet(this.credentials, this.provider)
    const contract = new ethers.Contract(
      lockAddress,
      [
        'function expirationDuration() constant view returns (uint256)',
        'function grantKeys(address[] _recipients,uint256[] _expirationTimestamps,address[] _keyManagers)',
      ],
      wallet
    )

    try {
      const lockDuration = await contract.expirationDuration()
      const expirationTimestamp = Math.floor(Date.now() / 1000) + lockDuration
      const tx = await contract.grantKeys(
        [recipient],
        [expirationTimestamp],
        [wallet.address]
      )

      return tx.hash
    } catch (error) {
      throw new Error('Unable to Grant Keys')
    }
  }
}
