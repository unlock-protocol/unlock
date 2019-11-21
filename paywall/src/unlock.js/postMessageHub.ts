import {
  BlockchainData,
  unlockNetworks,
} from 'src/data-iframe/blockchainHandler/blockChainTypes'
import { PostMessages } from '../messageTypes'
import DataIframeMessageEmitter from './PostMessageEmitters/DataIframeMessageEmitter'
import CheckoutIframeMessageEmitter from './PostMessageEmitters/CheckoutIframeMessageEmitter'
import AccountsIframeMessageEmitter from './PostMessageEmitters/AccountsIframeMessageEmitter'
import { PaywallConfig } from '../unlockTypes'
import {
  Web3Window,
  web3MethodCall,
  CryptoWalletWindow,
  SendAsyncProvider,
  SendProvider,
} from '../windowTypes'
import { injectDefaultBalance } from '../utils/balance'

// This file consolidates all the event handlers for post messages within the
// `unlock.js` sub-sub-repo. The goal here is to bring them all in one area and
// start to peel back the layers. Once we have a complete accounting of post
// messaging we can replace the custom infrastructure with a library.

interface unconditionalStartupArgs {
  iframes: TemporaryIframeHandler
  blockchainData: BlockchainData
  usingManagedAccount: boolean
  erc20ContractAddress: string
  toggleLockState: (
    message: PostMessages.LOCKED | PostMessages.UNLOCKED
  ) => void
  paywallConfig: PaywallConfig
  hideCheckoutIframe: () => void
  showAccountIframe: () => void
  hideAccountIframe: () => void
  setUserAccountAddress: (address: string | null) => void
  setUserAccountNetwork: (network: unlockNetworks) => void
}
// This function registers the postmessage listeners that are always active, no
// matter what state the app is in. The proxy wallet setups will have to be different.
export function unconditionalStartup({
  iframes,
  blockchainData,
  usingManagedAccount,
  erc20ContractAddress,
  toggleLockState,
  paywallConfig,
  hideCheckoutIframe,
  showAccountIframe,
  hideAccountIframe,
  setUserAccountAddress,
  setUserAccountNetwork,
}: unconditionalStartupArgs) {
  const { data, checkout, accounts } = iframes

  // These are the keys to the PostMessages enum that represent data transfer
  // from data iframe to consumers. In all cases for these, we simply update the
  // mirror in the main window and pass them on to the checkout and accounts iframes.
  // In a future iteration, we won't have distinct messages for each of these.
  const passThroughUpdates = [
    'LOCKS',
    'ACCOUNT',
    'NETWORK',
    'KEYS',
    'TRANSACTIONS',
  ]
  passThroughUpdates.forEach(name => {
    const enumKey = `UPDATE_${name}`
    const message = (PostMessages as any)[enumKey]
    data.on(message, payload => {
      checkout.postMessage(message, payload as any)
      accounts.postMessage(message, payload as any)
      ;(blockchainData as any)[name.toLowerCase()] = payload
    })
  })

  // This one update is different than the ones in the loop, due to the injection logic
  data.on(PostMessages.UPDATE_ACCOUNT_BALANCE, balance => {
    let balanceUpdate = balance
    if (usingManagedAccount) {
      balanceUpdate = injectDefaultBalance(balance, erc20ContractAddress)
    }
    checkout.postMessage(PostMessages.UPDATE_ACCOUNT_BALANCE, balanceUpdate)
    blockchainData.balance = balanceUpdate
  })

  data.on(PostMessages.ERROR, error => {
    checkout.postMessage(PostMessages.ERROR, error)
    if (error === 'no ethereum wallet is available') {
      toggleLockState(PostMessages.LOCKED)
    }
  })

  data.on(PostMessages.LOCKED, () => {
    checkout.postMessage(PostMessages.LOCKED, undefined)
    toggleLockState(PostMessages.LOCKED)
  })

  data.on(PostMessages.UNLOCKED, lockAddresses => {
    checkout.postMessage(PostMessages.UNLOCKED, lockAddresses)
    toggleLockState(PostMessages.UNLOCKED)
  })

  data.on(PostMessages.READY, () => {
    data.postMessage(PostMessages.CONFIG, paywallConfig)
  })

  accounts.on(PostMessages.READY, () => {
    // once the accounts iframe is ready, request the current account and
    // default network
    accounts.postMessage(PostMessages.CONFIG, paywallConfig)
    accounts.postMessage(PostMessages.SEND_UPDATES, 'account')
    accounts.postMessage(PostMessages.SEND_UPDATES, 'network')

    // There may be a better way to organize sending the locks update to the
    // accounts iframe
    data.postMessage(PostMessages.SEND_UPDATES, 'locks')
  })

  accounts.on(PostMessages.SHOW_ACCOUNTS_MODAL, () => {
    showAccountIframe()
  })

  accounts.on(PostMessages.HIDE_ACCOUNTS_MODAL, () => {
    hideAccountIframe()
  })

  accounts.on(PostMessages.INITIATED_TRANSACTION, () => {
    data.postMessage(PostMessages.INITIATED_TRANSACTION, undefined)
  })

  accounts.on(PostMessages.UPDATE_ACCOUNT, address => {
    setUserAccountAddress(address)
  })

  accounts.on(PostMessages.UPDATE_NETWORK, network => {
    setUserAccountNetwork(network)
  })

  checkout.on(PostMessages.READY, () => {
    checkout.postMessage(PostMessages.CONFIG, paywallConfig)

    const updateKinds = [
      'locks',
      'account',
      'balance',
      'network',
      'keys',
      'transactions',
    ]

    updateKinds.forEach(kind =>
      data.postMessage(PostMessages.SEND_UPDATES, kind)
    )
  })

  checkout.on(PostMessages.DISMISS_CHECKOUT, () => {
    hideCheckoutIframe()
  })

  // when receiving a key purchase request, we either pass it to the
  // account iframe for credit card purchase if user accounts are
  // explicitly enabled, or to the crypto wallet
  checkout.on(PostMessages.PURCHASE_KEY, request => {
    if (usingManagedAccount) {
      accounts.postMessage(PostMessages.PURCHASE_KEY, request)
    } else {
      data.postMessage(PostMessages.PURCHASE_KEY, request)
    }
  })
}

// can't import IframeHandler here because it would create a dependency cycle;
// this will be fixed as we consolidate this postmessage code
interface TemporaryIframeHandler {
  data: DataIframeMessageEmitter
  checkout: CheckoutIframeMessageEmitter
  accounts: AccountsIframeMessageEmitter
}

export async function enableCryptoWallet(
  window: Web3Window,
  iframes: TemporaryIframeHandler
) {
  if (!window.web3 || !window.web3.currentProvider) {
    return
  }
  const wallet = window.web3.currentProvider
  if (!wallet.enable) {
    return
  }
  // TODO: what actually is this?
  iframes.checkout.postMessage(PostMessages.UPDATE_WALLET, true)
  await wallet.enable()
  iframes.checkout.postMessage(PostMessages.UPDATE_WALLET, false)
}

export function postResult(
  id: number,
  result: any,
  dataIframe: DataIframeMessageEmitter
) {
  dataIframe.postMessage(PostMessages.WEB3_RESULT, {
    id,
    jsonrpc: '2.0',
    result: {
      id,
      jsonrpc: '2.0',
      result,
    },
  })
}

interface setupUserAccountsProxyWalletArgs {
  iframes: TemporaryIframeHandler
  setHasWeb3: (value: boolean) => void
  getUserAccountAddress: () => string | null
  getUserAccountNetwork: () => unlockNetworks
}

export function setupUserAccountsProxyWallet({
  iframes,
  setHasWeb3,
  getUserAccountAddress,
  getUserAccountNetwork,
}: setupUserAccountsProxyWalletArgs) {
  // enable the user account wallet
  setHasWeb3(true)

  iframes.data.on(PostMessages.READY_WEB3, async () => {
    iframes.data.postMessage(PostMessages.WALLET_INFO, {
      noWallet: false,
      notEnabled: false,
      isMetamask: false,
    })
  })

  iframes.data.on(PostMessages.WEB3, payload => {
    const { method, id }: web3MethodCall = payload
    const userAccountAddress = getUserAccountAddress()
    const userAccountNetwork = getUserAccountNetwork()
    switch (method) {
      case 'eth_accounts':
        // if account is null, we have no account, so return []
        // userAccountAddress listening is in setupUserAccounts()
        postResult(
          id,
          userAccountAddress ? [userAccountAddress] : [],
          iframes.data
        )
        break
      case 'net_version':
        // userAccountNetwork listening is in setupUserAccounts()
        postResult(id, userAccountNetwork, iframes.data)
        break
      default:
        // this is a fail-safe, and will not happen unless there is a bug
        iframes.data.postMessage(PostMessages.WEB3_RESULT, {
          id,
          jsonrpc: '2.0',
          error: `"${method}" is not supported`,
        })
    }
  })
}

interface setupWeb3ProxyWalletArgs {
  iframes: TemporaryIframeHandler
  getHasWallet: () => boolean
  setHasWeb3: (value: boolean) => void
  getHasWeb3: () => boolean
  isMetamask: boolean
  window: Web3Window
}

export function setupWeb3ProxyWallet({
  iframes,
  getHasWallet,
  setHasWeb3,
  getHasWeb3,
  isMetamask,
  window,
}: setupWeb3ProxyWalletArgs) {
  // The next code is the main window side of Web3ProxyProvider, which is used in the data iframe
  // READY_WEB3 is sent when the Web3ProxyProvider is ready to go, and is used to determine the wallet type
  iframes.data.on(PostMessages.READY_WEB3, async () => {
    // initialize, we do this once the iframe is ready to receive information on the wallet
    // we need to tell the iframe if the wallet is metamask
    // TODO: pass the name of the wallet if we know it? (secondary importance right now, so omitting)
    if (!getHasWallet()) {
      // the user has no crypto wallet
      setHasWeb3(false)
      iframes.data.postMessage(PostMessages.WALLET_INFO, {
        noWallet: true,
        notEnabled: false,
        isMetamask: false,
      })
      return
    }
    // at this point, we have a wallet, the only question is whether it is enabled
    setHasWeb3(true)
    try {
      // first, enable the wallet if necessary
      await enableCryptoWallet(window, iframes)
    } catch (e) {
      // user declined to enable the crypto wallet
      // they still have a wallet, but we need to re-enable it to use it
      iframes.data.postMessage(PostMessages.WALLET_INFO, {
        noWallet: false,
        notEnabled: true, // user declined to enable the wallet
        isMetamask: isMetamask, // this is used for some decisions in signing
      })
      return
    }

    iframes.data.postMessage(PostMessages.WALLET_INFO, {
      noWallet: false,
      notEnabled: false,
      isMetamask: isMetamask, // this is used for some decisions in signing
    })
  })

  // WEB3 is used to send requests from the Web3ProxyProvider to the crypto wallet,
  // and to return the values. The crypto wallet uses the web3 interface, so
  // we will call its RPC handler and pass in a callback to send the result back
  // to the Web3ProxyProvider
  iframes.data.on(PostMessages.WEB3, payload => {
    // handler for the actual web3 calls
    if (!getHasWeb3()) {
      // error - no crypto wallet
      iframes.data.postMessage(PostMessages.WEB3_RESULT, {
        id: payload.id,
        jsonrpc: '2.0',
        error: 'No web3 wallet is available',
      })
      return
    }

    // the payload is validated inside DataIframeMessageEmitter
    const { method, params, id }: web3MethodCall = payload
    // to communicate with the crypto wallet,
    // use sendAsync if available, otherwise we will use send
    const web3 = (window as CryptoWalletWindow).web3.currentProvider
    const send =
      (web3 as SendAsyncProvider).sendAsync || (web3 as SendProvider).send

    // we use call to bind the web3 call to the crypto wallet's web3 provider
    send.call(
      web3,
      {
        method,
        params,
        jsonrpc: '2.0',
        id,
      },
      (error: string | null, result?: any) => {
        // this callback is called by the crypto wallet
        // with the result of the web3 call, we pass
        // it back to the Web3ProxyProvider
        iframes.data.postMessage(
          PostMessages.WEB3_RESULT,
          error
            ? {
                id,
                error,
                jsonrpc: '2.0',
              }
            : {
                id,
                result,
                jsonrpc: '2.0',
              }
        )
      }
    )
  })
}
