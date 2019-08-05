import { showIframe, hideIframe } from './iframeManager'
import {
  EventTypes,
  IframeManagingWindow,
  IframeType,
  LockStatus,
  UnlockProtocolWindow,
} from '../windowTypes'

interface hasPrototype {
  prototype?: any
}

export interface UnlockAndIframeManagerWindow
  extends IframeManagingWindow,
    UnlockProtocolWindow {}

// lockStatus holds the current state of the lock. It is undefined when we
// haven't yet determined whether the paywall is locked or unlocked (typically
// for a short period right after the page loads).
// lockStatus is _never_ used to make decisions within the paywall, it is simply
// a user-facing way to query the current state of the paywall
let lockStatus: LockStatus = undefined

export default function setupUnlockProtocolVariable(
  window: UnlockAndIframeManagerWindow,
  CheckoutUIIframe: IframeType
) {
  const loadCheckoutModal = () => {
    showIframe(window, CheckoutUIIframe)
  }
  const hideCheckoutModal = () => {
    hideIframe(window, CheckoutUIIframe)
  }
  const getState = () => lockStatus

  const unlockProtocol: hasPrototype = {}

  // Update the user-facing status with locked/unlocked updates
  window.addEventListener(EventTypes.UNLOCK, ({ detail }) => {
    lockStatus = detail
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
      !window.unlockProtocol ||
      window.unlockProtocol.loadCheckoutModal !== loadCheckoutModal
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

  return hideCheckoutModal
}
