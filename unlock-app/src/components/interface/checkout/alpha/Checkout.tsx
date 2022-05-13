import React from 'react'
import { PaywallConfig } from '~/unlockTypes'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { networkToLocksMap } from '~/utils/paywallConfig'
import { useConfig } from '~/utils/withConfig'
import { CheckoutState, useCheckout } from './useCheckoutState'
import { Shell } from './Shell'
import { Lock } from './Lock'

interface Props {
  initialStage: CheckoutState
  paywallConfig: PaywallConfig
  communication: ReturnType<typeof useCheckoutCommunication>
}

export function Checkout({
  communication,
  initialStage = 'select',
  paywallConfig,
}: Props) {
  const { checkoutState, setCheckoutStage } = useCheckout({
    initialStage,
    paywallConfig,
  })

  const config = useConfig()

  if (checkoutState.stage === 'select') {
    const networkToLocks = networkToLocksMap(paywallConfig)
    return (
      <Shell onClose={() => {}}>
        <div className="grid pt-4">
          {Object.entries(networkToLocks).map(([network, locks]) => (
            <section key={network}>
              <header>
                <div>
                  <h3 className="font-bold text-brand-ui-primary text-base">
                    {config.networks[network].name}
                  </h3>
                  <p className="text-sm text-brand-gray">
                    The most popular network{' '}
                  </p>
                </div>
              </header>
              <div>
                {locks.map(({ name, address }) => (
                  <Lock
                    name={name}
                    address={address}
                    network={Number(network)}
                    key={address}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </Shell>
    )
  }

  return null
}
