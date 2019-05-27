import { getLocks, getTransactions, getKeys } from '../cacheHandler'

// extraTip is not implemented yet, we need to do bignumber math, so post-pone this until walletService adds support
const makePurchaseCallback = ({
  walletService,
  web3Service,
  requiredConfirmations,
  update,
  window,
}) =>
  async function purchase(lockAddress /*, extraTip */) {
    const [
      { purchaseKey, processKeyPurchaseTransactions },
      locks,
      startingTransactions,
      keys,
    ] = await Promise.all([
      import('../blockchainHandler/purchaseKey'),
      getLocks(window),
      getTransactions(window),
      getKeys(window),
    ])
    const startingKey = keys[lockAddress]

    Promise.all([
      purchaseKey({
        walletService,
        lockAddress,
        amountToSend: locks[lockAddress].keyPrice,
      }),
      processKeyPurchaseTransactions({
        walletService,
        web3Service,
        startingTransactions,
        startingKey,
        lockAddress,
        requiredConfirmations,
        update,
        walletAction: () => update({ walletAction: true }),
      }),
    ])
  }

export default makePurchaseCallback
