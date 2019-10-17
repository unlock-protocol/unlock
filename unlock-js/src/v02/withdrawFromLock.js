import { GAS_AMOUNTS } from '../constants'
import TransactionTypes from '../transactionTypes'
import Errors from '../errors'

/**
 * Triggers a transaction to withdraw funds from the lock and assign them to the owner.
 * Note: this version of the contract actually supports partialWithdraw() which we could use here.
 * @param {object} params
 * - {PropTypes.address} lockAddress
 */
export default async function({ lockAddress }) {
  const lockContract = await this.getLockContract(lockAddress)
  let transactionPromise
  try {
    transactionPromise = lockContract['withdraw()']({
      gasLimit: GAS_AMOUNTS.withdraw,
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
