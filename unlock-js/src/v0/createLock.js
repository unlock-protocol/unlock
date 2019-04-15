import Web3Utils from 'web3-utils'
import * as UnlockV0 from 'unlock-abi-0'
import { GAS_AMOUNTS } from '../constants'
import TransactionTypes from '../transactionTypes'

/**
 * Creates a lock on behalf of the user, using version v0
 * @param {PropTypes.lock} lock
 * @param {PropTypes.address} owner
 */
export default function(lock, owner) {
  const unlock = new this.web3.eth.Contract(
    UnlockV0.Unlock.abi,
    this.unlockContractAddress
  )

  const data = unlock.methods
    .createLock(
      lock.expirationDuration,
      Web3Utils.toWei(lock.keyPrice, 'ether'),
      lock.maxNumberOfKeys
    )
    .encodeABI()

  return this._sendTransaction(
    {
      to: this.unlockContractAddress,
      from: owner,
      data,
      gas: GAS_AMOUNTS.createLock,
      contract: UnlockV0.Unlock,
    },
    TransactionTypes.LOCK_CREATION,
    (error, hash) => {
      if (error) {
        return this.emit(
          'error',
          new Error(TransactionTypes.FAILED_TO_CREATE_LOCK)
        )
      }
      // Let's update the lock to reflect that it is linked to this
      // This is an exception because, until we are able to determine the lock address
      // before the transaction is mined, we need to link the lock and transaction.
      return this.emit('lock.updated', lock.address, {
        expirationDuration: lock.expirationDuration,
        keyPrice: lock.keyPrice, // Must be expressed in Eth!
        maxNumberOfKeys: lock.maxNumberOfKeys,
        owner: owner,
        outstandingKeys: 0,
        balance: '0',
        transaction: hash,
      })
    }
  )
}
