import { PaywallConfig } from 'src/unlockTypes'
import { UnlockWindowNoProtocolYet } from '../windowTypes'
import IframeHandler from './IframeHandler'
import Wallet from './Wallet'
import MainWindowHandler from './MainWindowHandler'
import StartupConstants from './startupTypes'
import { walletStatus } from '../utils/wallet'
import { checkoutHandlerInit } from './postMessageHub'
import { PostMessages } from '../messageTypes'
import { normalizeConfig } from '../utils/config'

// Temporary helper to dispatch locked event when we fail early
function dispatchEvent(detail: any, window: any) {
  let event
  try {
    event = new window.CustomEvent('unlockProtocol', { detail })
  } catch (e) {
    // older browsers do events this clunky way.
    // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events#The_old-fashioned_way
    // https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/initCustomEvent#Parameters
    event = window.document.createEvent('customevent')
    event.initCustomEvent(
      'unlockProtocol',
      true /* canBubble */,
      true /* cancelable */,
      detail
    )
  }
  window.dispatchEvent(event)
}

/**
 * Start the unlock app!
 */
export function startup(
  window: UnlockWindowNoProtocolYet,
  constants: StartupConstants,
  rawConfig?: PaywallConfig,
  launchModal: boolean = false
) {
  // normalize all of the lock addresses
  let config = normalizeConfig(rawConfig)

  // this next line ensures that the minimally valid configuration is passed to Wallet
  // TODO: provide some kind of developer mode which lazy-loads more extensive validation
  if (!config) {
    throw new Error(
      'Invalid configuration, please set window.unlockProtocolConfig'
    )
  }

  // There is no reason to do anything if window.web3 does not exist
  // and the config does not allow for user accounts. As a quick hack,
  // when that's the case we will purposely make the config invalid so
  // that we don't make any requests for lock data.
  const userAccountsAllowed = !!config.unlockUserAccounts
  const web3Present = !!window.web3
  if (!web3Present && !userAccountsAllowed) {
    config = {
      ...config,
      // This violates the expected value for locks on the paywall,
      // which will force the checkout into the "no wallet" state
      // without ever querying for any locks.
      locks: {},
    }
    dispatchEvent('locked', window)
  }

  const origin = `?origin=${encodeURIComponent(window.origin)}`
  // construct the 3 urls for the iframes
  const dataIframeUrl = `${constants.paywallUrl}/static/data-iframe.1.0.html${origin}`
  const checkoutIframeUrl = `${constants.paywallUrl}/checkout${origin}`
  const userIframeUrl = constants.accountsUrl + origin

  // create the iframes (the user accounts iframe is a dummy unless enabled in Wallet.setupWallet())
  const iframes = new IframeHandler(
    window,
    dataIframeUrl,
    checkoutIframeUrl,
    userIframeUrl
  )
  iframes.init(config)

  // user accounts is loaded on-demand inside of Wallet
  // set up the proxy wallet handler
  // the config must not be falsy here, so the checking "config.unlockUserAccounts" does not throw a TyoeError
  const wallet = new Wallet(window, iframes, config, constants)
  // set up the main window handler, for both events and hiding/showing iframes
  const mainWindow = new MainWindowHandler(window, iframes)

  // go!
  mainWindow.init()
  if (launchModal) {
    const listener = (accountAddress: string | null) => {
      if (accountAddress) {
        mainWindow.showCheckoutIframe()
        iframes.data.removeListener(PostMessages.UPDATE_ACCOUNT, listener)
      }
    }
    iframes.data.on(PostMessages.UPDATE_ACCOUNT, listener)
  }

  const walletInitParams = walletStatus(window, config)
  wallet.init(walletInitParams)

  checkoutHandlerInit({
    usingManagedAccount: walletInitParams.shouldUseUserAccounts,
    constants,
    config,
    dataIframe: iframes.data,
    checkoutIframe: iframes.checkout,
  })

  return iframes // this is only useful in testing, it is ignored in the app
}

// Make sure the page is ready before we try to start the app!
export default function startupWhenReady(
  window: Window,
  startupConstants: StartupConstants
) {
  const web3Present = !!(window as any).web3

  // Only try to do the deferred setup when we have a wallet. If we
  // don't, we can do setup right away, since it will just result in
  // the no wallet message.
  if (web3Present) {
    try {
      // The presence of a cached account address indicates that the
      // user has previously connected to MetaMask. In that case, it is
      // acceptable for us to initialize the app right away. However, if
      // there is no address in localStorage, we want to defer
      // initializing the app until the user chooses to load the
      // checkout modal.
      const cachedAccountAddress = window.localStorage.getItem(
        '__unlockProtocol.accountAddress'
      )
      if (!cachedAccountAddress) {
        // We have to dispatch locked right away, otherwise it will
        // never happen because we're stopping the rest of the app from
        // loading.
        ;(window as any).unlockProtocol = {
          loadCheckoutModal: () => {
            startup(
              (window as unknown) as UnlockWindowNoProtocolYet,
              startupConstants,
              ((window as unknown) as UnlockWindowNoProtocolYet)
                .unlockProtocolConfig,
              true
            )
          },
          resetConfig: (newConfig: PaywallConfig) => {
            startup(
              (window as unknown) as UnlockWindowNoProtocolYet,
              startupConstants,
              newConfig,
              false
            )
          },
        }
        dispatchEvent('locked', window)
        return
      }
    } catch (e) {
      // ignore
    }
  }

  let started = false
  if (document.readyState !== 'loading') {
    // in most cases, we will start up after the document is interactive
    // so listening for the DOMContentLoaded or load events is superfluous
    startup(
      (window as unknown) as UnlockWindowNoProtocolYet,
      startupConstants,
      ((window as unknown) as UnlockWindowNoProtocolYet).unlockProtocolConfig
    )
    started = true
  } else {
    const begin = () => {
      if (!started)
        startup(
          (window as unknown) as UnlockWindowNoProtocolYet,
          startupConstants,
          ((window as unknown) as UnlockWindowNoProtocolYet)
            .unlockProtocolConfig
        )
      started = true
    }
    // if we reach here, the page is still loading
    window.addEventListener('DOMContentLoaded', begin)
    window.addEventListener('load', begin)
  }
}
