import { getLocks, getTransactions, getKeys } from '../cacheHandler'

// extraTip is not implemented yet, we need to do bignumber math, so post-pone this until walletService adds support

/**
 * @param {walletService} walletService the walletService instance that will be used to purchase a key
 * @param {web3Service} web3Service the web3Service instance that will be used to monitor the transaction
 * @param {number} requiredConfirmations the minimum confirmations needed to consider the purchase final
 * @param {Function} update a callback that accepts a keyed object with updates to blockchain data
 * @param {window} window the current global context (window, global, self)
 */
const makePurchaseCallback = ({
  walletService,
  web3Service,
  requiredConfirmations,
  update,
  window,
  locksmithHost,
}) =>
  async function purchase(lockAddress /*, extraTip */) {
    // note that the dynamic import is what makes code splitting
    // happen, and cannot be changed to a static import
    // https://webpack.js.org/guides/code-splitting/#dynamic-imports
    const [
      {
        purchaseKey,
        processKeyPurchaseTransactions,
      } /* import('../blockchainHandler/purchaseKey') */,
      locks /* getLocks(window) */,
      startingTransactions /* getTransactions(window) */,
      keys /* getKeys(window) */,
    ] = await Promise.all([
      import('../blockchainHandler/purchaseKey'), // code-splitting import
      getLocks(window),
      getTransactions(window),
      getKeys(window),
    ])
    const startingKey = keys[lockAddress]

    try {
      const lock = locks[lockAddress]
      await Promise.all([
        purchaseKey({
          walletService,
          lockAddress,
          amountToSend: lock.keyPrice,
          erc20Address: lock.currencyContractAddress,
        }),
        processKeyPurchaseTransactions({
          walletService,
          web3Service,
          startingTransactions,
          startingKey,
          lockAddress,
          requiredConfirmations,
          update,
          walletAction: () => update({ walletModal: true }),
          window,
          locksmithHost,
        }),
      ])
    } catch (error) {
      update({ error: error.message })
    }
  }

export default makePurchaseCallback
