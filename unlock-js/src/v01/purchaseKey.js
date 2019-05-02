/* eslint no-console: 0 */

import * as UnlockV01 from 'unlock-abi-0-1'
import Web3Utils from '../utils'
import { GAS_AMOUNTS } from '../constants'
import Errors from '../errors'
import TransactionTypes from '../transactionTypes'

/**
 * Purchase a key to a lock by account.
 * The key object is passed so we can kepe track of it from the application
 * The lock object is required to get the price data
 * We pass both the owner and the account because at some point, these may be different (someone
 * purchases a key for someone else)
 * @param {PropTypes.address} lock
 * @param {PropTypes.address} owner
 * @param {string} keyPrice
 * @param {string} account
 * @param {string} data // This field was previously available but has now been deprecated
 */
export default function(lock, owner, keyPrice, account, data = '') {
  if (data !== '') {
    console.warn('The data field on purchaseFor has been deprecated.')
  }
  const lockContract = new this.web3.eth.Contract(
    UnlockV01.PublicLock.abi,
    lock
  )
  const abi = lockContract.methods.purchaseFor(owner).encodeABI()

  return this._sendTransaction(
    {
      to: lock,
      from: account,
      data: abi,
      gas: GAS_AMOUNTS.purchaseFor,
      value: Web3Utils.toWei(keyPrice, 'ether'),
      contract: UnlockV01.PublicLock,
    },
    TransactionTypes.KEY_PURCHASE,
    error => {
      if (error) {
        return this.emit('error', new Error(Errors.FAILED_TO_PURCHASE_KEY))
      }
    }
  )
}
