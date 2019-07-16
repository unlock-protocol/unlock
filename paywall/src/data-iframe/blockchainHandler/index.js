import { WalletService, Web3Service } from '@unlock-protocol/unlock-js'
import { setNetwork } from './network'
import { setAccount, setAccountBalance, pollForAccountChange } from './account'
import getLocks from './getLocks'
import getKeys from './getKeys'
import locksmithTransactions from './locksmithTransactions'
import ensureWalletReady from './ensureWalletReady'
import web3ServiceHub from './web3ServiceHub'

/**
 * @param {string} unlockAddress the ethereum address of the current Unlock contract
 * @param {string|provider} provider the address of a JSON-RPC endpoint or a web3 provider
 * @param {Function} onChange the callback to use when there is no provider
 * @returns {walletService}
 */
export function setupWalletService({ unlockAddress, provider, onChange }) {
  const walletService = new WalletService({ unlockAddress })
  walletService
    .connect(provider)
    .then(() => {
      walletService.getAccount()
    })
    .catch(error => {
      onChange({ error, account: null })
    })

  return walletService
}

/**
 * This is here simply because we have to encapsulate all unlock-js
 * inside the blockchain handler
 * @returns {web3Service}
 */
export function setupWeb3Service({
  unlockAddress,
  readOnlyProvider,
  blockTime,
  requiredConfirmations,
  onChange,
  window,
  locksmithHost,
}) {
  const web3Service = new Web3Service({
    unlockAddress,
    readOnlyProvider,
    blockTime,
    requiredConfirmations,
    onChange,
    window,
    locksmithHost,
  })
  // start listening for transaction updates and errors
  web3ServiceHub({ web3Service, onChange, window })
  return web3Service
}

/**
 * @param {array} locksToRetrieve an array of lock ethereum addresses to retrieve
 * @param {seb3Service} web3Service used to retrieve locks, and keys
 * @param {walletService} walletService used to ensure the user account is known prior to key/transaction retrieval
 * @param {window} window the global context (window, self, global)
 * @param {string} locksmithHost the endpoint for locksmith
 * @param {Function} onChange the change callback, which is used by the data iframe to cache data and pass it to the
 *                            main window
 */
export async function retrieveChainData({
  locksToRetrieve,
  web3Service,
  walletService,
  window,
  locksmithHost,
  onChange,
}) {
  onChange({ locks: await getLocks({ locksToRetrieve, web3Service }) })

  return await getKeysAndTransactions({
    walletService,
    locks: locksToRetrieve,
    web3Service,
    window,
    locksmithHost,
  })
}

/**
 * Retrieve the locks and transactions for the current user
 * @param {walletService} walletService used to ensure the user account is known prior to key/transaction retrieval
 * @param {seb3Service} web3Service used to retrieve locks, and keys
 * @param {array} locks an array of lock ethereum addresses to retrieve
 * @param {window} window the global context (window, self, global)
 * @param {string} locksmithHost the endpoint for locksmith
 */
export async function getKeysAndTransactions({
  walletService,
  web3Service,
  locks,
  window,
  locksmithHost,
}) {
  await ensureWalletReady(walletService)
  const [keys] = await Promise.all([
    getKeys({ walletService, locks, web3Service }),
    // trigger retrieval of transactions. web3ServiceHub will do the actual
    // propagation of transactions to the cache
    locksmithTransactions({
      window,
      locksmithHost,
      web3Service,
      walletService,
    }),
  ])
  return { keys }
}

/**
 * @param {walletService} walletService used to ensure the user account is known prior to key/transaction retrieval
 * @param {seb3Service} web3Service used to retrieve locks, and keys
 * @param {Function} onChange the change callback, which is used by the data iframe to cache data and pass it to the
 *                            main window
 */
export async function listenForAccountNetworkChanges({
  locksToRetrieve,
  walletService,
  web3Service,
  locksmithHost,
  onChange,
  window,
}) {
  walletService.on('network.changed', id => {
    setNetwork(id)
    onChange({ network: id })
  })

  pollForAccountChange(walletService, web3Service, async (account, balance) => {
    setAccount(account)
    onChange({ account })
    setAccountBalance(balance)
    onChange({ balance })
    // account has changed, it is time to update transactions and keys
    // keys will be returned and passed to the cache
    if (account) {
      onChange(
        await getKeysAndTransactions({
          walletService,
          locks: locksToRetrieve,
          web3Service,
          window,
          locksmithHost,
        })
      )
    } else {
      // ensure we have no keys or transactions for logged out user
      onChange({ keys: {}, transactions: {} })
    }
  })

  // TODO: investigate whether this can be safely removed
  await ensureWalletReady(walletService)
  const account = await walletService.getAccount()
  const balance = await web3Service.getAddressBalance(account)
  setAccount(account)
  onChange({ account })
  setAccountBalance(balance)
  onChange({ balance })
}
