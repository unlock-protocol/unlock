import { ETHERS_MAX_UINT } from '../../constants'

export default async function (
  { lockAddress, recipients, expirations, keyManagers },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)

  if (!expirations?.length) {
    // Let's get the expiration from the duration (+/- given that the transaction can take time to be mined!)
    const duration = await lockContract.expirationDuration()

    if (ETHERS_MAX_UINT.eq(duration)) {
      // Add equal number of expirations to recipients length
      expirations = new Array(recipients.length).fill(ETHERS_MAX_UINT)
    } else {
      expirations = new Array(recipients.length).fill(
        Math.floor(new Date().getTime() / 1000 + duration.toNumber())
      )
    }
  }

  if (!keyManagers?.length) {
    // By default the the key manager is the granter
    const signer = this.signer
    const manager = await signer.getAddress()
    keyManagers = new Array(recipients.length).fill(manager)
  }

  if (recipients.length !== expirations.length) {
    throw new Error(
      "Number of recipients don't match the number of expirations provided"
    )
  }

  if (recipients.length !== keyManagers.length) {
    throw new Error(
      "Number of recipients don't match the number of keyManagers provided"
    )
  }

  const transactionPromise = lockContract.grantKeys(
    recipients,
    expirations,
    keyManagers,
    transactionOptions || {}
  )

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  // Let's now wait for the transaction to go thru to return the token id
  const receipt = await this.provider.waitForTransaction(hash)
  const parser = lockContract.interface

  const transferEvents = receipt.logs
    .map((log) => {
      if (log.address.toLowerCase() !== lockAddress.toLowerCase()) return // Some events are triggered by the ERC20 contract
      return parser.parseLog(log)
    })
    .filter((event) => {
      return event && event.name === 'Transfer'
    })

  if (transferEvents.length) {
    return transferEvents.map((item) => {
      return {
        id: item.args.tokenId.toString(),
        owner: item.args.to.toString(),
      }
    })
  }
  // There was no Transfer log (transaction failed?)
  return null
}
