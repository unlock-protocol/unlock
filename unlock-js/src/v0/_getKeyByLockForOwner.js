/**
 * Returns the key to the lock by the account.
 * @private
 * @param {PropTypes.string} lock
 * @param {PropTypes.string} owner
 * @return Promise<>
 */
export default function(lockContract, owner) {
  return new Promise(resolve => {
    const getKeyExpirationPromise = lockContract.methods
      .keyExpirationTimestampFor(owner)
      .call()
    const getKeyDataPromise = lockContract.methods.keyDataFor(owner).call()

    Promise.all([getKeyExpirationPromise, getKeyDataPromise])
      .then(([expiration, data]) => {
        return resolve([parseInt(expiration, 10), data])
      })
      .catch(() => {
        return resolve([0, null])
      })
  })
}
