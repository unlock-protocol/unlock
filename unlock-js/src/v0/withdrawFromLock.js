import { GAS_AMOUNTS } from '../constants'
import TransactionTypes from '../transactionTypes'
import Errors from '../errors'

/**
 * Triggers a transaction to withdraw funds from the lock and assign them to the owner.
 * @param {PropTypes.address} lock
 */
export default async function(lockAddress) {
  const lockContract = await this.getLockContract(lockAddress)
  let transactionPromise
  try {
    transactionPromise = lockContract['withdraw()']({
      gasLimit: GAS_AMOUNTS.withdraw, // overrides default value for transaction gas price
    })
    const ret = await this._handleMethodCall(
      transactionPromise,
      TransactionTypes.WITHDRAWAL
    )
    return ret
  } catch (error) {
    this.emit('error', new Error(Errors.FAILED_TO_WITHDRAW_FROM_LOCK))
  }
}
