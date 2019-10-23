import { GAS_AMOUNTS } from '../constants'
import TransactionTypes from '../transactionTypes'

/**
 * Triggers a transaction to withdraw funds from the lock and assign them to the owner.
 * Note: this version of the contract actually supports partialWithdraw() which we could use here.
 * @param {PropTypes.address} lockAddress
 */
export default async function({ lockAddress }) {
  const lockContract = await this.getLockContract(lockAddress)
  const transactionPromise = lockContract['withdraw()']({
    gasLimit: GAS_AMOUNTS.withdraw,
  })
  const ret = await this._handleMethodCall(
    transactionPromise,
    TransactionTypes.WITHDRAWAL
  )
  return ret
}
