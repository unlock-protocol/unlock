import { ZERO } from '../../constants'

export default async function (
  {
    lockAddress,
    keyPurchase = ZERO,
    keyCancel = ZERO,
    validKey = ZERO,
    tokenURI = ZERO,
    keyTransfer = ZERO,
  },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)

  const transactionPromise = lockContract.setEventHooks(
    keyPurchase,
    keyCancel,
    validKey,
    tokenURI,
    keyTransfer
  )

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash)
  }

  await this.provider.waitForTransaction(hash)

  return null
}
