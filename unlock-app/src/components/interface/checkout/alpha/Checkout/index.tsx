import React from 'react'
import type { PaywallConfig } from '~/unlockTypes'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { useCheckout } from '../useCheckoutState'
import { Shell } from '../Shell'
import { Select } from './Select'
import { Quantity } from './Quantity'
import { Metadata } from './Metadata'
import { Confirm } from './Confirm'
import { MessageToSign } from './MessageToSign'

interface Props {
  injectedProvider: unknown
  paywallConfig: PaywallConfig
  communication: ReturnType<typeof useCheckoutCommunication>
}

export function Checkout({ paywallConfig, injectedProvider }: Props) {
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
      case 'QUANTITY': {
        return (
          <Quantity
            injectedProvider={injectedProvider}
            paywallConfig={paywallConfig}
            dispatch={dispatch}
            state={checkout.state}
          />
        )
      }
      case 'METADATA': {
        return (
          <Metadata
            injectedProvider={injectedProvider}
            paywallConfig={paywallConfig}
            dispatch={dispatch}
            state={checkout.state}
          />
        )
      }
      case 'CONFIRM': {
        return (
          <Confirm
            injectedProvider={injectedProvider}
            paywallConfig={paywallConfig}
            dispatch={dispatch}
            state={checkout.state}
          />
        )
      }

      case 'MESSAGE_TO_SIGN': {
        return (
          <MessageToSign
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
