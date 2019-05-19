import ensureWalletReady from './ensureWalletReady'
import { getAccount } from './account'
import { getKeyStatus } from './keyStatus'

export default async function getKeys({
  walletService,
  locks,
  web3Service,
  requiredConfirmations,
}) {
  await ensureWalletReady(walletService)

  const account = getAccount()

  const newKeys = await Promise.all(
    locks.map(lock => web3Service.getKeysByLockForOwner(lock, account))
  )

  const keys = newKeys.reduce(
    (allKeys, key) => ({
      ...allKeys,
      [`${key.lock}-${account}`]: {
        ...key,
        status: getKeyStatus(key, requiredConfirmations),
        // defaults. to fill in actual values, call linkTransactionsToKeys
        confirmations: 0,
        transactions: [],
      },
    }),
    {}
  )
  return keys
}
