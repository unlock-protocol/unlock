import ensureWalletReady from './ensureWalletReady'
import { getAccount } from './account'

export default async function getKeys({ walletService, locks, web3Service }) {
  await ensureWalletReady(walletService)

  const account = getAccount()

  const keys = await Promise.all(
    locks.map(async lock => web3Service.getKeyByLockForOwner(lock, account))
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
