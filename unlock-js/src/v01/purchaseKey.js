import Web3Utils from '../utils'
import { GAS_AMOUNTS } from '../constants'
import TransactionTypes from '../transactionTypes'
import Errors from '../errors'

/**
 * Purchase a key to a lock by account.
 * The key object is passed so we can kepe track of it from the application
 * The lock object is required to get the price data
 * We pass both the owner and the account because at some point, these may be different (someone
 * purchases a key for someone else)
 * @param {PropTypes.address} lock
 * @param {PropTypes.address} owner
 * @param {string} keyPrice
 * @param {string} data
 * @param {string} account
 */
export default async function(lockAddress, owner, keyPrice) {
  const lockContract = await this.getLockContract(lockAddress)
  let transactionPromise
  try {
    transactionPromise = lockContract['purchaseFor(address)'](owner, {
      gasLimit: GAS_AMOUNTS.purchaseFor, // overrides default value for transaction gas price
      value: Web3Utils.toWei(keyPrice, 'ether'), // overrides default value
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
