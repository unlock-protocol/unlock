import utils from '../utils'
import { GAS_AMOUNTS } from '../constants'
import TransactionTypes from '../transactionTypes'
import Errors from '../errors'

/**
 * Triggers a transaction to withdraw funds from the lock and assign them to the owner.
 * @param {PropTypes.address} lock
 * @param {PropTypes.address} amount
 * @param {Function} callback TODO: implement...
 */
export default async function(lockAddress, amount = '0') {
  const lockContract = await this.getLockContract(lockAddress)
  let transactionPromise
  const weiAmount = utils.toWei(amount) // TODO: fix for ERC20 locks for which the amount to withdraw may be of a different unit!

  try {
    transactionPromise = lockContract['withdraw(uint256)'](weiAmount, {
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
