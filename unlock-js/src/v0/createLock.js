import ethersUtils from '../utils.ethers'
import { GAS_AMOUNTS } from '../constants'
import TransactionTypes from '../transactionTypes'

/**
 * Creates a lock on behalf of the user, using version v0
 * @param {PropTypes.lock} lock
 * @param {PropTypes.address} owner
 */
export default async function(lock, owner) {
  const unlockContract = await this.getUnlockContract()
  let transactionPromise
  try {
    transactionPromise = unlockContract.functions[
      'createLock(uint256,uint256,uint256)'
    ](
      lock.expirationDuration,
      ethersUtils.toWei(lock.keyPrice, 'ether'),
      lock.maxNumberOfKeys,
      {
        gasLimit: GAS_AMOUNTS.createLock, // overrides default value for transaction gas price
      }
    )
    const hash = await this._handleMethodCall(
      transactionPromise,
      TransactionTypes.LOCK_CREATION
    )

    // Let's update the lock to reflect that it is linked to this
    // This is an exception because, until we are able to determine the lock address
    // before the transaction is mined, we need to link the lock and transaction.
    this.emit('lock.updated', lock.address, {
      expirationDuration: lock.expirationDuration,
      keyPrice: lock.keyPrice, // Must be expressed in Eth!
      maxNumberOfKeys: lock.maxNumberOfKeys,
      owner: owner,
      outstandingKeys: 0,
      balance: '0',
      transaction: hash,
    })
  } catch (error) {
    this.emit('error', new Error(TransactionTypes.FAILED_TO_CREATE_LOCK))
  }
}
