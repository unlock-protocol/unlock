import utils from '../utils'
import { GAS_AMOUNTS } from '../constants'
import TransactionTypes from '../transactionTypes'
import Errors from '../errors'

/**
 * Purchase key function. This implementation requires the following
 * @param {object} params:
 * - {PropTypes.address} lockAddress
 * - {PropTypes.address} owner
 * - {string} keyPrice
 * - {string} data
 * TODO: add callback to yield the transaction hash
 */
export default async function({ lockAddress, owner, keyPrice, data }) {
  const lockContract = await this.getLockContract(lockAddress)
  let transactionPromise
  try {
    transactionPromise = lockContract['purchaseFor(address,bytes)'](
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
    // Let's now wait for the transaction to go thru to return the token id
    const receipt = await this.provider.waitForTransaction(hash)
    const parser = lockContract.interface

    const transferEvent = receipt.logs
      .map(log => {
        return parser.parseLog(log)
      })
      .filter(event => {
        return event.name === 'Transfer'
      })[0]
    if (transferEvent) {
      return transferEvent.values._tokenId.toString()
    } else {
      // There was no Transfer log (transaction failed?)
      return null
    }
  } catch (error) {
    this.emit('error', new Error(Errors.FAILED_TO_PURCHASE_KEY))
  }
}
