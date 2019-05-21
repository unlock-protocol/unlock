import { getAccount } from './account'

/**
 * Retrieve lock information and construct default keys for the locks
 *
 * @param {array} locksToRetrieve an array of lock addresses to retrieve
 * @param {object} existingKeys a map indexing keys by key id
 * @param {web3Service} web3Service the web3Service, needed for getLock
 * @returns {{ locks, keys }}
 */
export default async function getLocksAndKeys({
  locksToRetrieve,
  existingKeys,
  web3Service,
}) {
  const newLocks = await Promise.all(
    locksToRetrieve.map(lockAddress => web3Service.getLock(lockAddress))
  )
  const account = getAccount()
  const keys = { ...existingKeys }
  // convert into a map indexed by lock address
  const locks = newLocks.reduce(
    (allLocks, lock) => ({ ...allLocks, [lock.address]: lock }),
    {}
  )
  newLocks.forEach(lock => {
    const lockAddress = lock.address
    if (account) {
      const keyId = `${lockAddress}-${account}`
      if (!keys[keyId]) {
        // create a default key for every lock that doesn't already have one
        keys[keyId] = {
          lock: lockAddress,
          owner: account,
          expiration: 0,
          status: 'none',
          confirmations: 0,
          transactions: [],
        }
      }
    }
  })
  return { locks, keys }
}
