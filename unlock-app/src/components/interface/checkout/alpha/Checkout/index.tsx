import React, { useState } from 'react'
import type { Lock as LockType, PaywallConfig } from '~/unlockTypes'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { useConfig } from '~/utils/withConfig'
import { CheckoutState, useCheckout } from '../useCheckoutState'
import { Shell } from '../Shell'
import { Select } from './Select'
import { Quantity } from './Quantity'

interface Props {
  initialStage: CheckoutState
  injectedProvider: unknown
  paywallConfig: PaywallConfig
  communication: ReturnType<typeof useCheckoutCommunication>
}

export function Checkout({
  communication,
  initialStage = 'select',
  paywallConfig,
  injectedProvider,
}: Props) {
  const { checkoutState, setCheckoutStage } = useCheckout({
    initialStage,
    paywallConfig,
  })

  const [lock, setLock] = useState<LockType | null>(null)

  const config = useConfig()

  function Content() {
    switch (checkoutState.stage) {
      case 'quantity': {
        return <Quantity lock={lock!} paywallConfig={paywallConfig} />
      }
      default: {
        return (
          <Select
            injectedProvider={injectedProvider}
            paywallConfig={paywallConfig}
            navigate={(page: CheckoutState) => setCheckoutStage(page)}
          />
        )
      }
    }
  }

  return (
    <Shell.Root onClose={() => {}}>
      <Shell.Head
        description={checkoutState.content.description}
        title={paywallConfig.title}
        iconURL={paywallConfig.icon!}
      />
      <Content />
    </Shell.Root>
  )
}
