import Web3Utils from 'web3-utils'
import * as UnlockV01 from 'unlock-abi-0-1'
import { GAS_AMOUNTS } from '../constants'
import Errors from '../errors'
import TransactionTypes from '../transactionTypes'

/**
 *
 * @param {PropTypes.address} lock : address of the lock for which we update the price
 * @param {PropTypes.address} account: account who owns the lock
 * @param {string} price : new price for the lock
 */
export default function(lock, account, price) {
  const lockContract = new this.web3.eth.Contract(
    UnlockV01.PublicLock.abi,
    lock
  )
  const data = lockContract.methods
    .updateKeyPrice(Web3Utils.toWei(price, 'ether'))
    .encodeABI()

  return this._sendTransaction(
    {
      to: lock,
      from: account,
      data,
      gas: GAS_AMOUNTS.updateKeyPrice,
      contract: UnlockV01.PublicLock,
    },
    TransactionTypes.UPDATE_KEY_PRICE,
    error => {
      if (error) {
        return this.emit('error', new Error(Errors.FAILED_TO_UPDATE_KEY_PRICE))
      }
    }
  )
}
