import Web3Utils from '../utils'
import { GAS_AMOUNTS } from '../constants'
import TransactionTypes from '../transactionTypes'
import Errors from '../errors'

/**
 * Purchase key function. This implementation requires the following
 * @param {object} params:
 * - {PropTypes.address} lockAddress
 * - {PropTypes.address} owner
 * - {string} keyPrice
 */
export default async function({ lockAddress, owner, keyPrice }) {
  const lockContract = await this.getLockContract(lockAddress)
  let transactionPromise
  try {
    transactionPromise = lockContract['purchaseFor(address)'](owner, {
      gasLimit: GAS_AMOUNTS.purchaseFor,
      value: Web3Utils.toWei(keyPrice, 'ether'),
    })
    const ret = await this._handleMethodCall(
      transactionPromise,
      TransactionTypes.KEY_PURCHASE
    )
    return ret
  } catch (error) {
    this.emit('error', new Error(Errors.FAILED_TO_PURCHASE_KEY))
  }
}
