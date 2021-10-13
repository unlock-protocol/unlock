/* eslint-disable import/no-extraneous-dependencies */
import { PaywallConfig } from '@unlock-protocol/types'
import { Enabler } from './enableInjectedProvider'

/**
 * Dispatches events
 * @param eventName
 * @param params
 */
export const dispatchEvent = (eventName: string, params: any) => {
  if (eventName === unlockEvents.status) {
    // Supporting legacy unlockProtocol event
    dispatchEvent('unlockProtocol', params.state)
  }
  let event: any
  try {
    event = new window.CustomEvent(eventName, { detail: params })
  } catch (e) {
    // older browsers do events this clunky way.
    // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events#The_old-fashioned_way
    // https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/initCustomEvent#Parameters
    event = window.document.createEvent('customevent')
    event.initCustomEvent(
      eventName,
      true /* canBubble */,
      true /* cancelable */,
      params
    )
  }
  window.dispatchEvent(event)
}

/**
 * Mapping between events and their names
 */
export const unlockEvents = {
  status: 'unlockProtocol.status',
  authenticated: 'unlockProtocol.authenticated',
  transactionSent: 'unlockProtocol.transactionSent',
  closeModal: 'unlockProtocol.closeModal',
}

export const setupUnlockProtocolVariable = (properties: {
  [name: string]: any
}) => {
  const unlockProtocol: Object = {}

  const immutable = {
    writable: false,
    configurable: false,
    enumerable: false,
  }

  const immutableProperties = Object.keys(properties).map((name) => {
    return {
      [name]: {
        value: properties[name],
        ...immutable,
      },
    }
  })

  Object.defineProperties(
    unlockProtocol,
    Object.assign({}, ...immutableProperties)
  )

  const freeze: (_obj: any) => void = Object.freeze || Object

  // if freeze is available, prevents adding or
  // removing the object prototype properties
  // (value, get, set, enumerable, writable, configurable)
  // TODO: consider whether this is actually necessary
  freeze(unlockProtocol)

  try {
    Object.defineProperties(window, {
      unlockProtocol: {
        value: unlockProtocol,
        ...immutable,
      },
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('WARNING: unlockProtocol already defined, cannot re-define it')
  }
}

export const injectProviderInfo = (
  config: PaywallConfig,
  provider?: Enabler
) => {
  const newConfig = { ...config }

  // We want to inform the checkout iframe about the availability of a
  // delegated provider. However, we will not overwrite an existing
  // value in the config, in case the paywall owner has reason to
  // force it one way or the other.
  if (!newConfig.useDelegatedProvider) {
    newConfig.useDelegatedProvider = !!provider
  }

  return newConfig
}
