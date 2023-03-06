import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { setupUnlockProtocolVariable } from '../utils'
import { networkConfigs, Paywall } from '@unlock-protocol/paywall'

export default function UnlockPaywall() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rawConfig = {
        locks: {
          '0x0a2173b20e476ce53bcff430f9dbda596d84b9d7': {
            network: 5,
          },
        },
      }

      window.unlockProtocolConfig = rawConfig

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

        const paywall = new Paywall(rawConfig, networkConfigs)
        const {
          getState,
          getUserAccountAddress,
          loadCheckoutModal,
          resetConfig,
        } = paywall

        setupUnlockProtocolVariable({
          loadCheckoutModal,
          resetConfig,
          getUserAccountAddress,
          getState,
        })

        loadCheckoutModal()
      }
    }
  }, [])

  return <p>Hello world</p>
}
