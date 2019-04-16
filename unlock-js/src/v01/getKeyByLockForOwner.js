import * as UnlockV0 from 'unlock-abi-0'
import { KEY_ID } from '../constants'
/**
 * Returns the key to the lock by the account.
 * @param {PropTypes.string} lock
 * @param {PropTypes.string} owner
 */
export default function(lock, owner) {
  const lockContract = new this.web3.eth.Contract(UnlockV0.PublicLock.abi, lock)
  return this._getKeyByLockForOwner(lockContract, owner).then(
    ([expiration, data]) => {
      this.emit('key.updated', KEY_ID(lock, owner), {
        lock,
        owner,
        expiration,
        data,
      })
    }
  )
}
