import utils from '../utils'
import { GAS_AMOUNTS } from '../constants'
import TransactionTypes from '../transactionTypes'
import Errors from '../errors'

/**
 * Changes the price of keys on a given lock
 * @param {object} params
 * - {PropTypes.address} lockAddress : address of the lock for which we update the price
 * - {string} keyPrice : new price for the lock, as a string (as wei)
 */
export default async function({ lockAddress, keyPrice }) {
  const lockContract = await this.getLockContract(lockAddress)
  let transactionPromise
  try {
    transactionPromise = lockContract['updateKeyPrice(uint256)'](
      utils.toWei(keyPrice, 'ether'),
      {
        gasLimit: GAS_AMOUNTS.updateKeyPrice,
      }
    )
    const ret = await this._handleMethodCall(
      transactionPromise,
      TransactionTypes.UPDATE_KEY_PRICE
    )
    return ret
  } catch (error) {
    this.emit('error', new Error(Errors.FAILED_TO_UPDATE_KEY_PRICE))
  }
}
