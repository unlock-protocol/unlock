import {
  Web3Window,
  web3MethodCall,
  IframeType,
  IframeManagingWindow,
} from '../windowTypes'
import {
  MapHandlers,
  MessageHandlerTemplates,
  PostMessageToIframe,
} from './setupIframeMailbox'
import { PostMessages, MessageTypes } from '../messageTypes'
import { waitFor } from '../utils/promises'
import { hideIframe, showIframe } from './iframeManager'
import { Locks } from '../unlockTypes'

let hasWeb3 = true
const NO_WEB3 = 'no web3 wallet'

export function enable(window: Web3Window) {
  return new window.Promise((resolve, reject) => {
    if (!window.web3 || !window.web3.currentProvider) {
      return resolve(NO_WEB3)
    }
    if (!window.web3.currentProvider.enable) return resolve()
    window.web3.currentProvider
      .enable()
      .then(() => {
        return resolve()
      })
      .catch((e: any) => {
        reject(e)
      })
  })
}

interface UnvalidatedPayload {
  method?: any
  id?: any
  params?: any
}
export function validateMethodCall(payload: UnvalidatedPayload) {
  if (!payload || typeof payload !== 'object') return
  if (!payload.method || typeof payload.method !== 'string') {
    return false
  }
  if (!payload.params || !Array.isArray(payload.params)) {
    return false
  }
  if (typeof payload.id !== 'number' || Math.round(payload.id) !== payload.id) {
    return false
  }
  return true
}

export function hasERC20Lock(locks: Locks) {
  return !!Object.values(locks).filter(lock => lock.currencyContractAddress)
    .length
}

/**
 * This is the fake web3 provider we use for user accounts. It knows only
 * 2 kinds of method calls, account and network.
 */
export function handleWeb3Call({
  payload,
  proxyAccount,
  proxyNetwork,
  postMessage,
}: {
  payload: UnvalidatedPayload
  proxyAccount: string | null
  proxyNetwork: string | number
  postMessage: PostMessageToIframe<MessageTypes>
}) {
  if (!validateMethodCall(payload)) return
  const { method, id } = payload as web3MethodCall
  switch (method) {
    case 'eth_accounts':
      postMessage('data', PostMessages.WEB3_RESULT, {
        id,
        jsonrpc: '2.0',
        result: {
          id,
          jsonrpc: '2.0',
          // if account is null, we have no account, so return []
          result: proxyAccount ? [proxyAccount] : [],
        },
      })
      break
    case 'net_version':
      postMessage('data', PostMessages.WEB3_RESULT, {
        id,
        jsonrpc: '2.0',
        result: { id, jsonrpc: '2.0', result: proxyNetwork },
      })
      break
    default:
      postMessage('data', PostMessages.WEB3_RESULT, {
        id,
        jsonrpc: '2.0',
        error: `"${method}" is not supported`,
      })
  }
}

/**
 * Proxy calls to web3 from postMessage
 *
 * @param {window} window the main window object
 * @param {element} iframe the iframe element, created by document.createElement('iframe')
 * @param {string} origin the iframe element's URL origin
 */
export default function web3Proxy(
  window: Web3Window & IframeManagingWindow,
  mapHandlers: MapHandlers
) {
  // use sendAsync if available, otherwise we will use send
  const send =
    window.web3 &&
    window.web3.currentProvider &&
    (window.web3.currentProvider.sendAsync || window.web3.currentProvider.send)
  let proxyAccount: null | string = null
  let proxyNetwork: string | number
  let accountIframeReady = false
  let currentLocks: Locks
  let canUseUserAccounts: boolean = !window.web3
  let hasNativeWeb3Wallet = !!window.web3
  let showIframeWhenReady = false

  const useUnlockAccount = () => !hasNativeWeb3Wallet && canUseUserAccounts

  // we need to listen for the account iframe's READY event, and request the current account and network
  const accountHandlers: MessageHandlerTemplates<MessageTypes> = {
    [PostMessages.READY]: postMessage => {
      return () => {
        postMessage('account', PostMessages.SEND_UPDATES, 'account')
        postMessage('account', PostMessages.SEND_UPDATES, 'network')
      }
    },
    [PostMessages.UPDATE_ACCOUNT]: () => {
      return account => {
        proxyAccount = account
        accountIframeReady = true
      }
    },
    [PostMessages.UPDATE_NETWORK]: () => {
      return network => {
        proxyNetwork = network
      }
    },
    [PostMessages.INITIATED_TRANSACTION]: postMessage => {
      return () => {
        // prompt the data iframe to refresh transactions
        postMessage('data', PostMessages.INITIATED_TRANSACTION, undefined)
      }
    },
    [PostMessages.SHOW_ACCOUNTS_MODAL]: (
      _postMessage,
      _dataIframe,
      checkoutIframe,
      accountIframe
    ) => {
      return () => {
        if (
          (canUseUserAccounts && !currentLocks) ||
          !currentLocks ||
          !Object.keys(currentLocks).length
        ) {
          // we haven't gotten the locks yet
          showIframeWhenReady = true
        }
        if (canUseUserAccounts) {
          showIframe(window, accountIframe)
          hideIframe(window, checkoutIframe)
        }
      }
    },
    [PostMessages.HIDE_ACCOUNTS_MODAL]: (
      _postMessage,
      _dataIframe,
      checkoutIframe,
      accountIframe
    ) => {
      return () => {
        // Need to check for canUseUserAccounts here because otherwise this will
        // run when using metamask, causing the checkoutIframe to always appear
        if (canUseUserAccounts) {
          hideIframe(window, accountIframe)
          showIframe(window, checkoutIframe)
        }
      }
    },
  }

  const checkForUserAccountWallet = async (
    accountIframe: IframeType,
    checkoutIframe: IframeType,
    postMessage: PostMessageToIframe<MessageTypes>
  ) => {
    // we don't have web3
    // wait for locks to be retrieved
    await waitFor(() => currentLocks)
    // wait for locks to be populated
    await waitFor(() => Object.keys(currentLocks).length)
    if (process.env.DEBUG) {
      // eslint-disable-next-line
      console.log('[USER ACCOUNTS] got locks')
    }
    // wait for the account iframe, then respond
    await waitFor(() => accountIframeReady)
    if (process.env.DEBUG) {
      // eslint-disable-next-line
      console.log('[USER ACCOUNTS] got account from user accounts iframe')
    }
    // we will use the proxy account!
    if (!canUseUserAccounts) {
      if (process.env.DEBUG) {
        // eslint-disable-next-line
        console.log('[USER ACCOUNTS] cannot use user accounts')
      }

      // if we don't have any locks that can be purchased with a user
      // account, we have no wallet
      hasWeb3 = false
      postMessage('data', PostMessages.WALLET_INFO, {
        noWallet: true,
        notEnabled: false,
        isMetamask: false,
      })
      return
    } else if (canUseUserAccounts && !proxyAccount) {
      // show the login form if the user is not logged in
      showIframe(window, accountIframe)
      hideIframe(window, checkoutIframe)
    }
    hasWeb3 = true
    postMessage('data', PostMessages.WALLET_INFO, {
      noWallet: false,
      notEnabled: false,
      isMetamask: false, // this is used for some decisions in signing
    })
  }

  const dataHandlers: MessageHandlerTemplates<MessageTypes> = {
    [PostMessages.UPDATE_LOCKS]: (
      _postMessage,
      _dataIframe,
      checkoutIframe,
      accountIframe
    ) => {
      return locks => {
        canUseUserAccounts = !hasNativeWeb3Wallet && hasERC20Lock(locks)
        if (process.env.DEBUG) {
          // eslint-disable-next-line
          console.log('[USER ACCOUNTS] hasERC20Locks?', hasERC20Lock(locks))
          // eslint-disable-next-line
          console.log('[USER ACCOUNTS] no wallet?', !hasNativeWeb3Wallet)
        }

        currentLocks = locks
        if (canUseUserAccounts && locks && Object.keys(locks).length) {
          if (showIframeWhenReady) {
            showIframe(window, accountIframe)
            hideIframe(window, checkoutIframe)
            // turn the flag off, we don't want to re-open the user accounts iframe
            // every time the locks change
            showIframeWhenReady = false
          }
        }
      }
    },
    [PostMessages.READY_WEB3]: (
      postMessage,
      _dataIframe,
      checkoutIframe,
      accountIframe
    ) => {
      return async () => {
        // initialize, we do this once the iframe is ready to receive information on the wallet
        // we need to tell the iframe if the wallet is metamask
        // TODO: pass the name of the wallet if we know it? (secondary importance right now, so omitting)
        const isMetamask = !!(
          window.web3 &&
          window.web3.currentProvider &&
          window.web3.currentProvider.isMetamask
        )
        try {
          const result = await enable(window)
          if (result === NO_WEB3) {
            checkForUserAccountWallet(
              accountIframe,
              checkoutIframe,
              postMessage
            )
            return
          }
          hasWeb3 = true
          postMessage('data', PostMessages.WALLET_INFO, {
            noWallet: false,
            notEnabled: false,
            isMetamask, // this is used for some decisions in signing
          })
        } catch (e) {
          hasWeb3 = true
          postMessage('data', PostMessages.WALLET_INFO, {
            noWallet: false,
            notEnabled: true, // user declined to enable the wallet
            isMetamask: false,
          })
          return
        }
      }
    },
    [PostMessages.WEB3]: postMessage => {
      return async payload => {
        // handler for the actual web3 calls
        if (!hasWeb3) {
          return postMessage('data', PostMessages.WEB3, {
            id: payload.id,
            jsonrpc: '2.0',
            error: 'No web3 wallet is available',
          })
        }

        if (!validateMethodCall(payload)) return

        const { method, params, id }: web3MethodCall = payload
        if (useUnlockAccount()) {
          // we are using the user account
          handleWeb3Call({
            payload,
            proxyAccount,
            proxyNetwork,
            postMessage,
          })
          return // do not attempt to call send on the current provider
        }
        // we use call to bind the call to the current provider
        send &&
          send.call(
            window.web3 && window.web3.currentProvider,
            {
              method,
              params,
              jsonrpc: '2.0',
              id,
            },
            (error: string | null, result: any) => {
              postMessage(
                'data',
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
      }
    },
  }

  const checkoutHandlers: MessageHandlerTemplates<MessageTypes> = {
    [PostMessages.PURCHASE_KEY]: postMessage => {
      return details => {
        // relay a request to purchase a key to the data iframe
        // as the user has clicked on a key in the checkout UI
        if (useUnlockAccount()) {
          // we are using unlock account, so send to the account iframe instead
          postMessage('account', PostMessages.PURCHASE_KEY, details)
        } else {
          postMessage('data', PostMessages.PURCHASE_KEY, details)
        }
      }
    },
  }

  mapHandlers('data', dataHandlers)
  mapHandlers('account', accountHandlers)
  mapHandlers('checkout', checkoutHandlers)
}
