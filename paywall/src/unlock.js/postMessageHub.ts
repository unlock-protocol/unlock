import {
  BlockchainData,
  unlockNetworks,
} from 'src/data-iframe/blockchainHandler/blockChainTypes'
import { PostMessages } from '../messageTypes'
import DataIframeMessageEmitter from './PostMessageEmitters/DataIframeMessageEmitter'
import CheckoutIframeMessageEmitter from './PostMessageEmitters/CheckoutIframeMessageEmitter'
import AccountsIframeMessageEmitter from './PostMessageEmitters/AccountsIframeMessageEmitter'
import { Balance, PaywallConfig } from '../unlockTypes'
import { Web3Window } from '../windowTypes'

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

interface iframeHandlerInitProps {
  config: PaywallConfig
  dataIframe: DataIframeMessageEmitter
  checkoutIframe: CheckoutIframeMessageEmitter
}

export function iframeHandlerInit({
  config,
  dataIframe,
  checkoutIframe,
}: iframeHandlerInitProps) {
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

interface mainWindowHandlerInitProps {
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
}: mainWindowHandlerInitProps) {
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

interface setupUserAccountsProps {
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
}: setupUserAccountsProps) {
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
