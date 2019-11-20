import {
  BlockchainData,
  unlockNetworks,
} from 'src/data-iframe/blockchainHandler/blockChainTypes'
import { PostMessages } from '../messageTypes'
import DataIframeMessageEmitter from './PostMessageEmitters/DataIframeMessageEmitter'
import CheckoutIframeMessageEmitter from './PostMessageEmitters/CheckoutIframeMessageEmitter'
import AccountsIframeMessageEmitter from './PostMessageEmitters/AccountsIframeMessageEmitter'
import { Balance, PaywallConfig } from '../unlockTypes'
import {
  Web3Window,
  web3MethodCall,
  CryptoWalletWindow,
  SendAsyncProvider,
  SendProvider,
} from '../windowTypes'

// This file consolidates all the event handlers for post messages within the
// `unlock.js` sub-sub-repo. The goal here is to bring them all in one area and
// start to peel back the layers. Once we have a complete accounting of post
// messaging we can replace the custom infrastructure with a library.

export interface checkoutHandlerInitArgs {
  usingManagedAccount: boolean
  dataIframe: DataIframeMessageEmitter
  checkoutIframe: CheckoutIframeMessageEmitter
  injectDefaultBalance: (
    oldBalance: Balance,
    erc20ContractAddress: string
  ) => Balance
  config: PaywallConfig
  constants: any
}

export function checkoutHandlerInit({
  usingManagedAccount,
  dataIframe,
  checkoutIframe,
  config,
  constants,
  injectDefaultBalance,
}: checkoutHandlerInitArgs) {
  // listen for updates to state from the data iframe, and forward them to the checkout UI
  dataIframe.on(PostMessages.UPDATE_ACCOUNT, account =>
    checkoutIframe.postMessage(PostMessages.UPDATE_ACCOUNT, account)
  )
  dataIframe.on(PostMessages.UPDATE_ACCOUNT_BALANCE, balance => {
    let balanceUpdate = balance
    if (usingManagedAccount) {
      const { erc20ContractAddress } = constants
      balanceUpdate = injectDefaultBalance(balance, erc20ContractAddress)
    }
    checkoutIframe.postMessage(
      PostMessages.UPDATE_ACCOUNT_BALANCE,
      balanceUpdate
    )
  })
  dataIframe.on(PostMessages.UPDATE_LOCKS, locks =>
    checkoutIframe.postMessage(PostMessages.UPDATE_LOCKS, locks)
  )
  dataIframe.on(PostMessages.UPDATE_KEYS, keys =>
    checkoutIframe.postMessage(PostMessages.UPDATE_KEYS, keys)
  )
  dataIframe.on(PostMessages.UPDATE_TRANSACTIONS, transactions => {
    return checkoutIframe.postMessage(
      PostMessages.UPDATE_TRANSACTIONS,
      transactions
    )
  })
  dataIframe.on(PostMessages.UPDATE_NETWORK, network =>
    checkoutIframe.postMessage(PostMessages.UPDATE_NETWORK, network)
  )

  // pass on the configuration and request the latest data
  checkoutIframe.on(PostMessages.READY, () => {
    checkoutIframe.postMessage(PostMessages.CONFIG, config)

    const updateKinds = [
      'locks',
      'account',
      'balance',
      'network',
      'keys',
      'transactions',
    ]

    updateKinds.forEach(kind =>
      dataIframe.postMessage(PostMessages.SEND_UPDATES, kind)
    )
  })

  // pass on any errors
  dataIframe.on(PostMessages.ERROR, error =>
    checkoutIframe.postMessage(PostMessages.ERROR, error)
  )

  // pass on locked status
  dataIframe.on(PostMessages.LOCKED, () =>
    checkoutIframe.postMessage(PostMessages.LOCKED, undefined)
  )
  dataIframe.on(PostMessages.UNLOCKED, lockAddresses =>
    checkoutIframe.postMessage(PostMessages.UNLOCKED, lockAddresses)
  )
}

interface iframeHandlerInitArgs {
  config: PaywallConfig
  dataIframe: DataIframeMessageEmitter
  checkoutIframe: CheckoutIframeMessageEmitter
}

export function iframeHandlerInit({
  config,
  dataIframe,
  checkoutIframe,
}: iframeHandlerInitArgs) {
  // TODO: consider removing the layer of event listeners and work with
  // postmessages directly
  checkoutIframe.setupListeners()
  // account listener setup will be on-demand, done by the Wallet in setupWallet()
  // Comment above verbatim from original site. Will likely be changed.

  dataIframe.on(PostMessages.READY, () => {
    dataIframe.postMessage(PostMessages.CONFIG, config)
  })
}

// can't import IframeHandler here because it would create a dependency cycle;
// this will be fixed as we consolidate this postmessage code
interface TemporaryIframeHandler {
  data: DataIframeMessageEmitter
  checkout: CheckoutIframeMessageEmitter
  accounts: AccountsIframeMessageEmitter
}

interface mainWindowHandlerInitArgs {
  iframes: TemporaryIframeHandler
  toggleLockState: (
    message: PostMessages.LOCKED | PostMessages.UNLOCKED
  ) => void
  hideCheckoutIframe: () => void
  showAccountIframe: () => void
  hideAccountIframe: () => void
  blockchainData: BlockchainData
}

export function mainWindowHandlerInit({
  iframes,
  toggleLockState,
  hideAccountIframe,
  showAccountIframe,
  hideCheckoutIframe,
  blockchainData,
}: mainWindowHandlerInitArgs) {
  // respond to "unlocked" and "locked" events by
  // dispatching "unlockProtocol" on the main window
  // and
  iframes.data.on(PostMessages.LOCKED, () => {
    toggleLockState(PostMessages.LOCKED)
  })
  iframes.data.on(PostMessages.UNLOCKED, () => {
    toggleLockState(PostMessages.UNLOCKED)
  })
  iframes.data.on(PostMessages.ERROR, e => {
    if (e === 'no ethereum wallet is available') {
      toggleLockState(PostMessages.LOCKED)
    }
  })

  // When the data iframe sends updates, store them in the mirror
  iframes.data.on(PostMessages.UPDATE_LOCKS, locks => {
    blockchainData.locks = locks
  })
  iframes.data.on(PostMessages.UPDATE_ACCOUNT, address => {
    blockchainData.account = address
  })
  iframes.data.on(PostMessages.UPDATE_ACCOUNT_BALANCE, balance => {
    blockchainData.balance = balance
  })
  iframes.data.on(PostMessages.UPDATE_NETWORK, network => {
    blockchainData.network = network
  })
  iframes.data.on(PostMessages.UPDATE_KEYS, keys => {
    blockchainData.keys = keys
  })
  iframes.data.on(PostMessages.UPDATE_TRANSACTIONS, transactions => {
    blockchainData.transactions = transactions
  })

  // handle display of checkout and account UI
  iframes.checkout.on(PostMessages.DISMISS_CHECKOUT, () => {
    hideCheckoutIframe()
  })

  iframes.accounts.on(PostMessages.SHOW_ACCOUNTS_MODAL, () => {
    showAccountIframe()
  })

  iframes.accounts.on(PostMessages.HIDE_ACCOUNTS_MODAL, () => {
    hideAccountIframe()
  })
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

interface setupUserAccountsArgs {
  iframes: TemporaryIframeHandler
  config: PaywallConfig
  setUserAccountAddress: (address: string | null) => void
  setUserAccountNetwork: (network: unlockNetworks) => void
}

export function setupUserAccounts({
  iframes,
  config,
  setUserAccountAddress,
  setUserAccountNetwork,
}: setupUserAccountsArgs) {
  // pass on the configuration and request the latest data. NOTE: accounts
  // iframe will not receive any messages until it has sent the READY message,
  // at which point buffered messages will flow into it
  iframes.accounts.on(PostMessages.READY, () => {
    iframes.accounts.postMessage(PostMessages.CONFIG, config)

    iframes.data.postMessage(PostMessages.SEND_UPDATES, 'locks')
  })

  // listen for updates to state from the data iframe, and forward them to the
  // checkout UI
  iframes.data.on(PostMessages.UPDATE_LOCKS, locks => {
    iframes.accounts.postMessage(PostMessages.UPDATE_LOCKS, locks)
  })

  // listen for account and network from the user accounts iframe
  iframes.accounts.on(PostMessages.UPDATE_ACCOUNT, address => {
    setUserAccountAddress(address)
  })
  iframes.accounts.on(PostMessages.UPDATE_NETWORK, network => {
    setUserAccountNetwork(network)
  })

  // when a purchase is in progress, tell the data iframe to retrieve the
  // transaction
  iframes.accounts.on(PostMessages.INITIATED_TRANSACTION, () => {
    iframes.data.postMessage(
      PostMessages.INITIATED_TRANSACTION,
      // TODO: passing undefined is limitation of the way messages are typed,
      // eventually it should be fixed the natural behavior would be passing
      // nothing as the 2nd argument
      undefined
    )
  })

  // then create the iframe and ready its post office
  iframes.accounts.createIframe()
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
  iframes.accounts.on(PostMessages.READY, () => {
    // once the accounts iframe is ready, request the current account and
    // default network
    iframes.accounts.postMessage(PostMessages.SEND_UPDATES, 'account')
    iframes.accounts.postMessage(PostMessages.SEND_UPDATES, 'network')
  })

  // when receiving a key purchase request, we either pass it to the
  // account iframe for credit card purchase if user accounts are
  // explicitly enabled, or to the crypto wallet
  iframes.checkout.on(PostMessages.PURCHASE_KEY, request => {
    iframes.accounts.postMessage(PostMessages.PURCHASE_KEY, request)
  })

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
  // when receiving a key purchase request, we either pass it to the
  // account iframe for credit card purchase if user accounts are
  // explicitly enabled, or to the crypto wallet
  iframes.checkout.on(PostMessages.PURCHASE_KEY, request => {
    iframes.data.postMessage(PostMessages.PURCHASE_KEY, request)
  })

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
