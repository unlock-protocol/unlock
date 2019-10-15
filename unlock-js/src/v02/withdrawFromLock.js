import { GAS_AMOUNTS } from '../constants'
import TransactionTypes from '../transactionTypes'
import utils from '../utils'

/**
 * Triggers a transaction to withdraw funds from the lock and assign them to the owner.
 * Note: this version of the contract actually supports partialWithdraw() which we could use here.
 * @param {object} params
 * - {PropTypes.address} lockAddress
 */
export default async function({ lockAddress }) {
  const lockContract = await this.getLockContract(lockAddress)
  const transactionPromise = lockContract['withdraw()']({
    gasLimit: GAS_AMOUNTS.withdraw,
  })
  const hash = await this._handleMethodCall(
    transactionPromise,
    TransactionTypes.WITHDRAWAL
  )

  // Let's now wait for the funds to have been withdrawn
  const receipt = await this.provider.waitForTransaction(hash)
  const parser = lockContract.interface
  const withdrawalEvent = receipt.logs
    .map(log => {
      return parser.parseLog(log)
    })
    .filter(event => {
      return event.name === 'Withdrawal'
    })[0]
  if (withdrawalEvent) {
    return utils.fromWei(withdrawalEvent.values._amount.toString(), 'ether')
  } else {
    // There was no Withdrawal log (transaction failed?)
    return null
  }
}
