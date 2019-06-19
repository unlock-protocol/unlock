import { showIframe, hideIframe } from './iframeManager'
import {
  IframeManagingWindow,
  UnlockProtocolWindow,
  IframeType,
} from '../windowTypes'

interface hasPrototype {
  prototype?: any
}

export interface UnlockAndIframeManagerWindow
  extends IframeManagingWindow,
    UnlockProtocolWindow {}

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

  const unlockProtocol: hasPrototype = {}

  Object.defineProperties(unlockProtocol, {
    loadCheckoutModal: {
      value: loadCheckoutModal,
      writable: false, // prevent changing loadCheckoutModal by simple `unlockProtocol.loadCheckoutModal = () => {}`
      configurable: false, // prevent re-defining the writable property
      enumerable: false, // prevent finding it exists via `for ... of`
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
