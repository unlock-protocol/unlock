import ethersUtils from '../utils'
import { GAS_AMOUNTS, ZERO, ETHERS_MAX_UINT } from '../constants'
import TransactionTypes from '../transactionTypes'
import { UNLIMITED_KEYS_COUNT } from '../../lib/constants'

/**
 * Creates a lock on behalf of the user, using version v0
 * @param {PropTypes.lock} lock
 * @param {PropTypes.address} owner
 */
export default async function(lock, owner) {
  const unlockContract = await this.getUnlockContract()
  let maxNumberOfKeys = lock.maxNumberOfKeys
  if (maxNumberOfKeys === UNLIMITED_KEYS_COUNT) {
    maxNumberOfKeys = ETHERS_MAX_UINT
  }
  let transactionPromise
  try {
    transactionPromise = unlockContract.functions[
      'createLock(uint256,address,uint256,uint256)'
    ](
      lock.expirationDuration,
      ZERO, // ERC20 address, 0 is for eth
      ethersUtils.toWei(lock.keyPrice, 'ether'),
      maxNumberOfKeys,
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
