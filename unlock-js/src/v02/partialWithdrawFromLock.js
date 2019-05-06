import utils from '../utils'
import { GAS_AMOUNTS } from '../constants'
import TransactionTypes from '../transactionTypes'
import Errors from '../errors'

/**
 * Triggers a transaction to withdraw some funds from the lock and assign them
 * to the owner.
 * @param {PropTypes.address} lock
 * @param {PropTypes.address} account
 * @param {string} ethAmount
 * @param {Function} callback
 */
export default async function(lockAddress, account, ethAmount, callback) {
  const lockContract = await this.getLockContract(lockAddress)
  const weiAmount = utils.toWei(ethAmount)
  let transactionPromise
  try {
    transactionPromise = lockContract['partialWithdraw(uint256)'](weiAmount, {
      gasLimit: GAS_AMOUNTS.partialWithdraw, // overrides default value for transaction gas price
    })
    const hash = await this._handleMethodCall(
      transactionPromise,
      TransactionTypes.WITHDRAWAL
    )
    callback()
    return hash
  } catch (error) {
    this.emit('error', new Error(Errors.FAILED_TO_WITHDRAW_FROM_LOCK))
    callback(error)
  }
}
