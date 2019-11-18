import {
  BlockchainData,
  unlockNetworks,
} from 'src/data-iframe/blockchainHandler/blockChainTypes'
import { PostMessages } from '../messageTypes'
import DataIframeMessageEmitter from './PostMessageEmitters/DataIframeMessageEmitter'
import CheckoutIframeMessageEmitter from './PostMessageEmitters/CheckoutIframeMessageEmitter'
import AccountsIframeMessageEmitter from './PostMessageEmitters/AccountsIframeMessageEmitter'
import { Balance, PaywallConfig } from '../unlockTypes'
import { web3MethodCall } from '../windowTypes'

// This file consolidates all the event handlers for post messages within the
// `unlock.js` sub-sub-repo. The goal here is to bring them all in one area and
// start to peel back the layers. Once we have a complete accounting of post
// messaging we can replace the custom infrastructure with a library.

export interface checkoutHandlerInitParams {
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
}: checkoutHandlerInitParams) {
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

interface iframeHandlerInitParams {
  config: PaywallConfig
  dataIframe: DataIframeMessageEmitter
  checkoutIframe: CheckoutIframeMessageEmitter
}

export function iframeHandlerInit({
  config,
  dataIframe,
  checkoutIframe,
}: iframeHandlerInitParams) {
  // TODO: consider removing the layer of event listeners and work with
  // postmessages directly
  dataIframe.setupListeners()
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

interface mainWindowHandlerInitParams {
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
}: mainWindowHandlerInitParams) {
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

interface setupUserAccountsParams {
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
}: setupUserAccountsParams) {
  // listen for updates to state from the data iframe, and forward them to the checkout UI
  iframes.data.on(PostMessages.UPDATE_LOCKS, locks => {
    iframes.accounts.postMessage(PostMessages.UPDATE_LOCKS, locks)
  })

  // pass on the configuration and request the latest data
  iframes.accounts.on(PostMessages.READY, () => {
    iframes.accounts.postMessage(PostMessages.CONFIG, config)

    iframes.data.postMessage(PostMessages.SEND_UPDATES, 'locks')
  })

  // listen for account and network from the user accounts iframe
  iframes.accounts.on(PostMessages.UPDATE_ACCOUNT, address => {
    setUserAccountAddress(address)
  })
  iframes.accounts.on(PostMessages.UPDATE_NETWORK, network => {
    setUserAccountNetwork(network)
  })

  // when a purchase is in progress, tell the data iframe to retrieve the transaction
  iframes.accounts.on(PostMessages.INITIATED_TRANSACTION, () => {
    iframes.data.postMessage(
      PostMessages.INITIATED_TRANSACTION,
      // TODO: passing undefined is limitation of the way messages are typed, eventually it should be fixed
      // the natural behavior would be passing nothing as the 2nd argument
      undefined
    )
  })

  // then create the iframe and ready its post office
  iframes.accounts.createIframe()
}

interface setupUserAccountsProxyWalletParams {
  iframes: TemporaryIframeHandler
  setHasWeb3: (value: boolean) => void
  getUserAccountAddress: () => string | null
  getUserAccountNetwork: () => unlockNetworks
}

/**
 * This is the proxy wallet for user accounts
 *
 * When the account iframe is ready, we request the account and network
 * When the data iframe Web3ProxyProvider is ready, we tell it that we
 * have a fully enabled wallet.
 * Then, we respond to "eth_accounts" and "net_version" only, passing
 * in the current values
 */
export function setupUserAccountsProxyWallet({
  iframes,
  setHasWeb3,
  getUserAccountAddress,
  getUserAccountNetwork,
}: setupUserAccountsProxyWalletParams) {
  // when receiving a key purchase request, we either pass it to the
  // account iframe for credit card purchase if user accounts are
  // explicitly enabled, or to the crypto wallet
  iframes.checkout.on(PostMessages.PURCHASE_KEY, request => {
    iframes.accounts.postMessage(PostMessages.PURCHASE_KEY, request)
  })
  iframes.accounts.on(PostMessages.READY, () => {
    // once the accounts iframe is ready, request the current account and
    // default network
    iframes.accounts.postMessage(PostMessages.SEND_UPDATES, 'account')
    iframes.accounts.postMessage(PostMessages.SEND_UPDATES, 'network')
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
        postResult(id, userAccountAddress ? [userAccountAddress] : [], iframes)
        break
      case 'net_version':
        // userAccountNetwork listening is in setupUserAccounts()
        postResult(id, userAccountNetwork, iframes)
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

  // We should also tell the checkout iframe that we are in a user account context
  iframes.checkout.once(PostMessages.READY, () => {
    iframes.checkout.postMessage(PostMessages.USING_MANAGED_ACCOUNT, undefined)
  })
}

export function postResult(
  id: number,
  result: any,
  iframes: TemporaryIframeHandler
) {
  iframes.data.postMessage(PostMessages.WEB3_RESULT, {
    id,
    jsonrpc: '2.0',
    result: {
      id,
      jsonrpc: '2.0',
      result,
    },
  })
}
