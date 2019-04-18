import Web3Utils from 'web3-utils'
import * as UnlockV02 from 'unlock-abi-0-2'
import { GAS_AMOUNTS } from '../constants'
import Errors from '../errors'
import TransactionTypes from '../transactionTypes'

/**
 * Triggers a transaction to withdraw some funds from the lock and assign them
 * to the owner.
 * @param {PropTypes.address} lock
 * @param {PropTypes.address} account
 * @param {string} ethAmount
 * @param {Function} callback
 */
export default function(lock, account, ethAmount, callback) {
  const lockContract = new this.web3.eth.Contract(
    UnlockV02.PublicLock.abi,
    lock
  )
  const weiAmount = Web3Utils.toWei(ethAmount)
  const data = lockContract.methods.partialWithdraw(weiAmount).encodeABI()

  return this._sendTransaction(
    {
      to: lock,
      from: account,
      data,
      gas: GAS_AMOUNTS.partialWithdrawFromLock,
      contract: UnlockV02.PublicLock,
    },
    TransactionTypes.WITHDRAWAL,
    error => {
      if (error) {
        this.emit('error', new Error(Errors.FAILED_TO_WITHDRAW_FROM_LOCK))
        return callback(error)
      }
      return callback()
    }
  )
}
