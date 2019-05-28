/**
 * Retrieve lock information and construct default keys for the locks
 *
 * @param {array} locksToRetrieve an array of lock addresses to retrieve
 * @param {object} existingKeys a map indexing keys by key id
 * @param {web3Service} web3Service the web3Service, needed for getLock
 * @returns {{ locks, keys }}
 */
export default async function getLocks({ locksToRetrieve, web3Service }) {
  const newLocks = await Promise.all(
    locksToRetrieve.map(lockAddress => web3Service.getLock(lockAddress))
  )
  // convert into a map indexed by lock address
  return newLocks.reduce(
    (allLocks, lock) => ({
      ...allLocks,
      [lock.address]: lock,
    }),
    {}
  )
}
