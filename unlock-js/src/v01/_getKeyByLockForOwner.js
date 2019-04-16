/**
 * Returns the key to the lock by the account.
 * @private
 * @param {PropTypes.string} lock
 * @param {PropTypes.string} owner
 * @return Promise<>
 */
export default function(lockContract, owner) {
  return new Promise(resolve => {
    lockContract.methods
      .keyExpirationTimestampFor(owner)
      .call()
      .then(expiration => {
        return resolve(parseInt(expiration, 10))
      })
      .catch(() => {
        return resolve(0)
      })
  })
}
