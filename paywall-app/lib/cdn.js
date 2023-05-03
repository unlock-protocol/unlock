// this is used to compile the lib and distribute to CDN
import { Paywall, networkConfigs } from '@unlock-protocol/paywall'

const setupUnlockProtocolVariable = (properties) => {
  const unlockProtocol = {}

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

  const freeze = Object.freeze || Object

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

if (typeof window !== 'undefined') {
  const rawConfig = window.unlockProtocolConfig

  if (!rawConfig) {
    console.error(
      'Missing window.unlockProtocolConfig. See docs on how to configure your locks: https://docs.unlock-protocol.com/'
    )
  } else {
    // set network based on hostname if missing in rawConfig
    if (!rawConfig.network) {
      rawConfig.network = 1
      console.info(
        'For backward compatibility setting default network to 1. See https://docs.unlock-protocol.com/'
      )
    } else {
      rawConfig.network = parseInt(rawConfig.network, 10)
    }

    const paywall = new Paywall(networkConfigs)
    paywall.setPaywallConfig(rawConfig)
    const {
      getState,
      getUserAccountAddress,
      loadCheckoutModal,
      setPaywallConfig,
      authenticate,
    } = paywall

    setupUnlockProtocolVariable({
      loadCheckoutModal,
      resetConfig: setPaywallConfig,
      getUserAccountAddress,
      getState,
      authenticate,
    })
  }
}
