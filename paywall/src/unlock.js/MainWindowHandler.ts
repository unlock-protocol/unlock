import { UnlockWindow, LockStatus, EventTypes } from '../windowTypes'
import IframeHandler from './IframeHandler'
import { PostMessages } from '../messageTypes'
import { PaywallConfig } from '../unlockTypes'

interface hasPrototype {
  prototype?: any
}

export default class MainWindowHandler {
  private window: UnlockWindow
  private iframes: IframeHandler
  private showCheckoutWhenAccountsHides: boolean = false
  private showingCheckout: boolean = false
  private showingAccountsIframe: boolean = false
  private lockStatus: LockStatus = undefined
  private config: PaywallConfig

  constructor(
    window: UnlockWindow,
    iframes: IframeHandler,
    config: PaywallConfig
  ) {
    this.window = window
    this.iframes = iframes
    this.config = config
  }

  init() {
    // this is a cache for the time between script startup and the full load
    // of the data iframe. The data iframe will then send down the current
    // value, overriding this. A bit later, the blockchain handler will update
    // with the actual value, so this is only used for a few milliseconds
    let locked
    try {
      locked = JSON.parse(
        this.window.localStorage.getItem('__unlockProtocol.locked') ||
          '"ignore"'
      )
    } catch (_) {
      locked = 'ignore'
    }
    if (locked === true) {
      this.dispatchEvent('locked')
    }
    if (locked === false) {
      this.dispatchEvent('unlocked')
    }
    this.setupUnlockProtocolVariable()
    this.iframes.data.on(PostMessages.LOCKED, () => {
      this.dispatchEvent('locked')
      try {
        // reset the cache to locked for the next page view
        window.localStorage.setItem(
          '__unlockProtocol.locked',
          JSON.stringify(true)
        )
      } catch (e) {
        // ignore
      }
    })
    this.iframes.data.on(PostMessages.UNLOCKED, () => {
      this.dispatchEvent('unlocked')
      try {
        // this is a fast cache. The value will only be used
        // to prevent a flash of ads on startup. If a cheeky
        // user attempts to prevent display of ads by setting
        // the localStorage cache, it will only work for a
        // few milliseconds
        window.localStorage.setItem(
          '__unlockProtocol.locked',
          JSON.stringify(false)
        )
      } catch (e) {
        // ignore
      }
    })

    // handle display of checkout and account UI
    this.iframes.checkout.on(PostMessages.DISMISS_CHECKOUT, () => {
      this.hideCheckoutIframe()
    })

    this.iframes.checkout.on(PostMessages.READY, () => {
      if (this.config && this.config.type === 'paywall') {
        // show the checkout UI
        this.showCheckoutIframe()
      }
    })

    this.iframes.accounts.on(PostMessages.SHOW_ACCOUNTS_MODAL, () => {
      this.showAccountIframe()
    })

    this.iframes.accounts.on(PostMessages.HIDE_ACCOUNTS_MODAL, () => {
      this.hideAccountIframe()
    })
  }

  setupUnlockProtocolVariable() {
    const loadCheckoutModal = () => {
      this.showCheckoutIframe()
    }
    const getState = () => this.lockStatus

    const unlockProtocol: hasPrototype = {}

    // Update the user-facing status with locked/unlocked updates
    this.window.addEventListener(EventTypes.UNLOCK, ({ detail }) => {
      this.lockStatus = detail
    })

    Object.defineProperties(unlockProtocol, {
      loadCheckoutModal: {
        value: loadCheckoutModal,
        writable: false, // prevent changing loadCheckoutModal by simple `unlockProtocol.loadCheckoutModal = () => {}`
        configurable: false, // prevent re-defining the writable property
        enumerable: false, // prevent finding it exists via `for ... of`
      },
      getState: {
        value: getState,
        writable: false,
        configurable: false,
        enumerable: false,
      },
    })

    const freeze: (obj: any) => void = Object.freeze || Object

    // if freeze is available, prevents adding or
    // removing the object prototype properties
    // (value, get, set, enumerable, writable, configurable)
    freeze(unlockProtocol.prototype)
    freeze(unlockProtocol)

    // set up the unlockProtocol object on the main window
    // it will be 100% read-only, unchangeable and un-deleteable
    try {
      if (
        !this.window.unlockProtocol ||
        this.window.unlockProtocol.loadCheckoutModal !== loadCheckoutModal
      ) {
        Object.defineProperties(window, {
          unlockProtocol: {
            writable: false, // prevent removing unlockProtocol from window via `window.unlockProtocol = {...}`
            configurable: false, // prevent re-defining the writable property
            enumerable: false, // prevent finding it exists via `for ... of`
            value: unlockProtocol,
          },
        })
      }
    } catch (e) {
      // TODO: decide whether to be more nuclear here
      // eslint-disable-next-line no-console
      console.error(
        'WARNING: unlockProtocol already defined, cannot re-define it'
      )
    }
  }

  dispatchEvent(detail: any) {
    let event
    try {
      event = new this.window.CustomEvent('unlockProtocol', { detail })
    } catch (e) {
      // older browsers do events this clunky way.
      // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events#The_old-fashioned_way
      // https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/initCustomEvent#Parameters
      event = this.window.document.createEvent('customevent')
      event.initCustomEvent(
        'unlockProtocol',
        true /* canBubble */,
        true /* cancelable */,
        detail
      )
    }
    this.window.dispatchEvent(event)
  }

  hideCheckoutIframe() {
    this.showCheckoutWhenAccountsHides = false
    this.showingCheckout = false
    this.iframes.checkout.hideIframe()
  }

  showCheckoutIframe() {
    if (this.showingAccountsIframe) {
      this.showCheckoutWhenAccountsHides = true
      this.showingCheckout = false
    } else {
      this.showingCheckout = true
      this.showCheckoutWhenAccountsHides = false
      this.iframes.checkout.showIframe()
    }
  }

  showAccountIframe() {
    if (this.showingCheckout) {
      this.showCheckoutWhenAccountsHides = true
      this.showingCheckout = false
      this.iframes.checkout.hideIframe()
    }
    this.iframes.accounts.showIframe()
  }

  hideAccountIframe() {
    this.showingAccountsIframe = false
    this.iframes.accounts.showIframe()
    if (this.showCheckoutWhenAccountsHides) {
      this.showingCheckout = true
      this.showCheckoutWhenAccountsHides = false
      this.iframes.checkout.showIframe()
    }
  }
}
