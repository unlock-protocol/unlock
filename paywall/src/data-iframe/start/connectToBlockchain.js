import makePurchaseCallback from './makePurchaseCallback'
import { setPurchaseKeyCallback } from './purchaseKeySetup'

/**
 * Starts the blockchain handler
 *
 * This lazy-loads the blockchain handler, web3 proxy provider, and
 * spins up walletService/web3Service and starts the machinery running
 * to read data from the chain, and then makes it possible to purchase
 * keys as well by setting up the key purchase callback
 *
 * @param {string} unlockAddress the contract address for the Unlock smart contract
 * @param {object} config the paywall config (window.unlockProtocolConfig)
 * @param {window} window the global context (window, self, global)
 * @param {string} readOnlyProvider the URL of our read-only blockchain server
 * @param {number} blockTime the approximate time between mined blocks on the selected chain
 * @param {number} requiredConfirmations the minimum confirmations needed for a key purchase
 *                                       transaction to be considered finalized
 * @param {string} locksmithHost the URL of our locksmith server
 * @param {Function} onChange the change notification callback, used for push notifications
 *                            when blockchain data changes
 */
export default async function connectToBlockchain({
  unlockAddress,
  config,
  window,
  readOnlyProvider,
  blockTime,
  requiredConfirmations,
  locksmithHost,
  onChange,
}) {
  // lazy-loading the blockchain handler, this is essential to implement
  // code splitting
  const [
    {
      default: Web3ProxyProvider,
    } /* import('../../providers/Web3ProxyProvider') */,
    {
      retrieveChainData,
      listenForAccountNetworkChanges,
      setupWalletService,
      setupWeb3Service,
    } /* import('../blockchainHandler/index') */,
  ] = await Promise.all([
    import('../../providers/Web3ProxyProvider'),
    import('../blockchainHandler/index'),
  ])

  // get the lock addresses this paywall monitors
  const locksToRetrieve = Object.keys(config.locks)

  const provider = new Web3ProxyProvider(window)
  const walletService = setupWalletService({ unlockAddress, provider })
  const web3Service = setupWeb3Service({
    unlockAddress,
    readOnlyProvider,
    blockTime,
    requiredConfirmations,
    window,
    onChange,
    locksmithHost,
  })

  // sets up key purchase as available
  setPurchaseKeyCallback(
    makePurchaseCallback({
      walletService,
      web3Service,
      requiredConfirmations,
      update: onChange,
      window,
    })
  )

  listenForAccountNetworkChanges({ walletService, web3Service, onChange })
  // at this point the blockchain handler is live!
  return retrieveChainData({
    locksToRetrieve,
    web3Service,
    walletService,
    window,
    locksmithHost,
    onChange,
    requiredConfirmations,
  })
}
