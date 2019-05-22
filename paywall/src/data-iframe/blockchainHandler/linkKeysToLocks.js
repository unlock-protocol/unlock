import { linkTransactionsToKey } from './keyStatus'

export default async function linkKeysToLocks({
  locks,
  keys,
  transactions,
  requiredConfirmations,
}) {
  const lockArray = Object.values(locks)

  // convert into a map indexed by lock address
  // and link each key to its lock
  return lockArray.reduce(
    (allLocks, lock) => ({
      ...allLocks,
      [lock.address]: {
        ...lock,
        key: linkTransactionsToKey({
          key: keys[lock.address],
          transactions,
          requiredConfirmations,
        }),
      },
    }),
    {}
  )
}
