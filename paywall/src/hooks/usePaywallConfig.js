import { useEffect } from 'react'

import { PostMessages } from '../messageTypes'

import useListenForPostMessage from './browser/useListenForPostMessage'
import usePostMessage from './browser/usePostMessage'
import { isValidPaywallConfig } from '../utils/validators'

/**
 * Merge in the call to action sentences from defaults for any that the
 * paywall configuration did not define
 *
 * @param {object} value paywall configuration passed in from main window
 * @param {object} defaults default value (defined below)
 */
export function getValue(value, defaults) {
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

export const defaultValue = {
  locks: {},
  icon: false,
  callToAction: {
    default:
      'You have reached your limit of free articles. Please purchase access',
    expired: 'Your access has expired. Please purchase a new key to continue',
    pending: 'Purchase pending...',
    confirmed: 'Purchase confirmed, content unlocked!',
  },
}

export default function usePaywallConfig() {
  const { postMessage } = usePostMessage('Checkout UI (usePaywallConfig)')
  const paywallConfig = useListenForPostMessage({
    type: PostMessages.CONFIG,
    validator: isValidPaywallConfig,
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
