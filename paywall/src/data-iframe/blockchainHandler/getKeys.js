import ensureWalletReady from './ensureWalletReady'
import { getAccount } from './account'

export default async function getKeys({ walletService, locks, web3Service }) {
  await ensureWalletReady(walletService)

  const account = getAccount()

  const keys = await Promise.all(
    locks.map(async lock => {
      const key = await web3Service.getKeyByLockForOwner(lock, account)
      // normalize the lock
      key.lock = key.lock.toLowerCase()
      return key
    })
  )

  return keys.reduce(
    (keysByLock, key) => ({
      ...keysByLock,
      [key.lock]: {
        ...key,
        owner: account,
      },
    }),
    {}
  )
}
