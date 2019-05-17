import ensureWalletReady from './ensureWalletReady'
import { getAccount } from './account'

export default async function getKeys({ walletService, locks, web3Service }) {
  await ensureWalletReady(walletService)

  const account = getAccount()
  const keys = {}

  const newKeys = await Promise.all(
    locks.map(lock => web3Service.getKeysByLockForOwner(lock, account))
  )

  newKeys.forEach(key => {
    const fullKey = {
      ...key,
      id: `${key.lock}-${account}`,
    }
    keys[fullKey.id] = fullKey
  })
  return keys
}
