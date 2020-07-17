import utils from '../utils'
import { GAS_AMOUNTS } from '../constants'
import TransactionTypes from '../transactionTypes'

/**
 * Purchase key function. This implementation requires the following
 * @param {object} params:
 * - {PropTypes.address} lockAddress
 * - {PropTypes.address} owner
 * - {string} keyPrice
 * - {string} data
 * @param {function} callback invoked with the transaction hash
 */
export default async function (
  { lockAddress, owner, keyPrice, data },
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  const transactionPromise = lockContract['purchaseFor(address,bytes)'](
    owner,
    utils.utf8ToHex(data || ''),
    {
      gasLimit: GAS_AMOUNTS.purchaseFor,
      value: utils.toWei(keyPrice, 'ether'),
    }
  )
  const hash = await this._handleMethodCall(
    transactionPromise,
    TransactionTypes.KEY_PURCHASE
  )

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  // Let's now wait for the transaction to go thru to return the token id
  const receipt = await this.provider.waitForTransaction(hash)
  const parser = lockContract.interface

  const transferEvent = receipt.logs
    .map((log) => {
      return parser.parseLog(log)
    })
    .filter((event) => {
      return event.name === 'Transfer'
    })[0]
  if (transferEvent) {
    return transferEvent.values._tokenId.toString()
  }
  // There was no Transfer log (transaction failed?)
  return null
}
