import { useEffect } from 'react'

import { PostMessages } from '../messageTypes'
import { PaywallConfig } from '../unlockTypes'

import useListenForPostMessage from './browser/useListenForPostMessage'
import usePostMessage from './browser/usePostMessage'

/**
 * NOTE: Do not use this hook anywhere other than CheckoutContent. It
 * is not safely written, so having more than one instance of it will
 * introduce major breakage.
 *
 * We should consider it deprecated at this point.
 */

/**
 * Merge in the call to action sentences from defaults for any that the
 * paywall configuration did not define
 *
 * @param {object} value paywall configuration passed in from main window
 * @param {object} defaults default value (defined below)
 */
export function getValue(value: any, defaults: any) {
  if (Object.keys(value.callToAction).length === 4) return value
  return {
    ...value,
    locks: Object.keys(value.locks).reduce(
      (locks, lockAddress) => ({
        ...locks,
        [lockAddress]: {
          // set a name if none was present
          name: value.locks[lockAddress].name || '',
        },
      }),
      {}
    ),
    callToAction: {
      ...defaults.callToAction,
      ...value.callToAction,
    },
  }
}

export const defaultValue: PaywallConfig = {
  locks: {},
  callToAction: {
    default:
      'You have reached your limit of free articles. Please purchase access',
    expired: 'Your access has expired. Please purchase a new key to continue',
    pending: 'Purchase pending...',
    confirmed: 'Purchase confirmed, content unlocked!',
    metadata:
      'We need to collect some additional information for your purchase.',
    noWallet:
      'To buy a key you will need to use a crypto-enabled browser that has a wallet. Here are a few options.',
  },
}

export default function usePaywallConfig() {
  const { postMessage } = usePostMessage('Checkout UI (usePaywallConfig)')
  const paywallConfig: PaywallConfig = useListenForPostMessage({
    type: PostMessages.CONFIG,
    // Always treat paywall config as valid in this context, if it's
    // invalid it's been checked in many other contexts and handled.
    validator: () => true,
    defaultValue,
    getValue,
    local: 'Checkout UI',
  })
  useEffect(() => {
    // this triggers the send of configuration from main window to the paywall
    // payload must be defined for the post office in unlock.min.js to recognize it as valid and from us
    postMessage({ type: PostMessages.READY, payload: undefined })
  }, [postMessage]) // only send this once, on startup
  return paywallConfig
}
