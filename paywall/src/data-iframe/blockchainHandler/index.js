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
 * @returns {walletService}
 */
export function setupWalletService({ unlockAddress, provider }) {
  const walletService = new WalletService({ unlockAddress })
  walletService.connect(provider).then(() => {
    walletService.getAccount()
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
 * @param {string} locksmithHost the endpoint for locksmith
 * @param {Function} onChange the change callback, which is used by the data iframe to cache data and pass it to the
 *                            main window
 * @param {number} requiredConfirmations the minimum number of confirmations needed to consider a key purchased
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

  ensureWalletReady(walletService)
  const [keys] = await Promise.all([
    getKeys({ walletService, locks: locksToRetrieve, web3Service }),
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
  walletService,
  web3Service,
  onChange,
}) {
  walletService.on('account.changed', address => {
    setAccount(address)
  })
  walletService.on('network.changed', id => {
    setNetwork(id)
    onChange({ network: id })
  })

  await ensureWalletReady(walletService)
  const account = await walletService.getAccount()
  const balance = await web3Service.getAddressBalance(account)
  setAccount(account)
  onChange({ account })
  setAccountBalance(balance)
  onChange({ balance })

  pollForAccountChange(walletService, web3Service, (account, balance) => {
    setAccount(account)
    onChange({ account })
    setAccountBalance(balance)
    onChange({ balance })
  })
}
