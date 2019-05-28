import makePurchaseCallback from './makePurchaseCallback'
import { setPurchaseKeyCallback } from './purchaseKeySetup'

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
  const [
    { default: Web3ProxyProvider },
    {
      retrieveChainData,
      listenForAccountNetworkChanges,
      setupWalletService,
      setupWeb3Service,
    },
  ] = await Promise.all([
    import('../../providers/Web3ProxyProvider'),
    import('../blockchainHandler/index'),
  ])
  const locksToRetrieve = Object.keys(config.locks)

  const provider = new Web3ProxyProvider(window)
  const walletService = setupWalletService({ unlockAddress, provider })
  const web3Service = setupWeb3Service({
    unlockAddress,
    readOnlyProvider,
    blockTime,
    requiredConfirmations,
  })

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
