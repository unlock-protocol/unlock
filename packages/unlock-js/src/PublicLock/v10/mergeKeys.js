import utils from '../../utils'

/**
 * Merge two keys together, partially or entirely . This implementation requires the following
 * @param {object} params:
 * - {PropTypes.address} lockAddress
 * - {number} tokenIdFrom
 * - {number} tokenIdTo
 * - {number} amount if null, will take the entire remaining time of the `fromKey`
 * @param {function} callback invoked with the transaction hash
 */
export default async function (
  { lockAddress, tokenIdFrom, tokenIdTo, amount },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)

  if (!tokenIdFrom) {
    throw new Error('Missing tokenId from')
  }
  if (!tokenIdTo) {
    throw new Error('Missing tokenId to')
  }

  // transfer entire remaining amount if nothing is specified
  if (!amount) {
    const blockNumber = await this.provider.getBlockNumber()
    const { timestamp } = await this.provider.getBlock(blockNumber)
    const expiration = await lockContract.keyExpirationTimestampFor(tokenIdFrom)
    amount = utils.bigNumberify(expiration).sub(timestamp + 3) // add 3 blocks so it doesnt revert
  }
  const transactionPromise = lockContract.mergeKeys(
    tokenIdFrom,
    tokenIdTo,
    amount
  )

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash)
  }

  await this.provider.waitForTransaction(hash)

  return null
}
