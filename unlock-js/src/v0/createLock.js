import ethersUtils from '../utils'
import { ETHERS_MAX_UINT } from '../constants'
import TransactionTypes from '../transactionTypes'
import { UNLIMITED_KEYS_COUNT } from '../../lib/constants'

/**
 * Creates a lock on behalf of the user, using version v0
 * @param {PropTypes.lock} lock
 * @param {function} callback invoked with the transaction hash
 */
export default async function (lock, callback) {
  const unlockContract = await this.getUnlockContract()
  let { maxNumberOfKeys } = lock
  if (maxNumberOfKeys === UNLIMITED_KEYS_COUNT) {
    maxNumberOfKeys = ETHERS_MAX_UINT
  }
  const transactionPromise = unlockContract.createLock(
    lock.expirationDuration,
    ethersUtils.toWei(lock.keyPrice, 'ether'),
    maxNumberOfKeys
  )
  const hash = await this._handleMethodCall(
    transactionPromise,
    TransactionTypes.LOCK_CREATION
  )

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  // Let's update the lock to reflect that it is linked to this
  // This is an exception because, until we are able to determine the lock address
  // before the transaction is mined, we need to link the lock and transaction.
  this.emit('lock.updated', lock.address, {
    expirationDuration: lock.expirationDuration,
    keyPrice: lock.keyPrice, // Must be expressed in Eth!
    maxNumberOfKeys: lock.maxNumberOfKeys,
    outstandingKeys: 0,
    balance: '0',
    transaction: hash,
  })

  // Let's now wait for the lock to be deployed before we return its address
  const receipt = await this.provider.waitForTransaction(hash)
  const parser = unlockContract.interface
  const newLockEvent = receipt.logs
    .map((log) => {
      return parser.parseLog(log)
    })
    .filter((event) => event.name === 'NewLock')[0]

  if (newLockEvent) {
    return newLockEvent.values.newLockAddress
  }
  // There was no NewEvent log (transaction failed?)
  return null
}
