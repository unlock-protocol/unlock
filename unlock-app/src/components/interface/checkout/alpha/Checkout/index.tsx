import React from 'react'
import type { PaywallConfig } from '~/unlockTypes'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { useCheckout } from '../useCheckoutState'
import { Shell } from '../Shell'
import { Select } from './Select'

interface Props {
  injectedProvider: unknown
  paywallConfig: PaywallConfig
  communication: ReturnType<typeof useCheckoutCommunication>
}

export function Checkout({
  communication,
  paywallConfig,
  injectedProvider,
}: Props) {
  const { checkout, dispatch } = useCheckout({
    initialState: {
      current: 'SELECT',
    },
    paywallConfig,
  })

  function Content() {
    switch (checkout.state.current) {
      case 'SELECT': {
        return (
          <Select
            injectedProvider={injectedProvider}
            paywallConfig={paywallConfig}
            dispatch={dispatch}
            state={checkout.state}
          />
        )
      }
      default: {
        return null
      }
    }
  }

  return (
    <Shell.Root onClose={() => {}}>
      <Shell.Head
        description={checkout.content.description}
        title={paywallConfig.title!}
        iconURL={paywallConfig.icon!}
      />
      <Content />
    </Shell.Root>
  )
}
