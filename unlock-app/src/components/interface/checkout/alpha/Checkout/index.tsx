import React from 'react'
import type { PaywallConfig } from '~/unlockTypes'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { checkoutMachine, CheckoutPage } from '../checkoutMachine'
import { Shell } from '../Shell'
import { Select } from './Select'
import { Quantity } from './Quantity'
import { Metadata } from './Metadata'
import { Confirm } from './Confirm'
import { MessageToSign } from './MessageToSign'
import { Minting } from './Minting'
import { CardPayment } from './CardPayment'
import { useCheckoutHeadContent } from '../useCheckoutHeadContent'
import { useMachine } from '@xstate/react'
interface Props {
  injectedProvider: unknown
  paywallConfig: PaywallConfig
  communication: ReturnType<typeof useCheckoutCommunication>
}

export function Checkout({ paywallConfig, injectedProvider }: Props) {
  const [state, send] = useMachine(checkoutMachine, {
    context: {
      paywallConfig,
    },
  })

  const { title, description } = useCheckoutHeadContent(
    paywallConfig,
    state.value as CheckoutPage
  )

  const onClose = () => {
    // TODO
  }

  function Content() {
    switch (state.value) {
      case 'SELECT': {
        return (
          <Select
            injectedProvider={injectedProvider}
            paywallConfig={paywallConfig}
            send={send}
            state={state}
          />
        )
      }
      case 'QUANTITY': {
        return (
          <Quantity
            injectedProvider={injectedProvider}
            paywallConfig={paywallConfig}
            send={send}
            state={state}
          />
        )
      }
      case 'CARD': {
        return (
          <CardPayment
            injectedProvider={injectedProvider}
            paywallConfig={paywallConfig}
            send={send}
            state={state}
          />
        )
      }
      case 'METADATA': {
        return (
          <Metadata
            injectedProvider={injectedProvider}
            paywallConfig={paywallConfig}
            send={send}
            state={state}
          />
        )
      }
      case 'CONFIRM': {
        return (
          <Confirm
            injectedProvider={injectedProvider}
            paywallConfig={paywallConfig}
            send={send}
            state={state}
          />
        )
      }
      case 'MESSAGE_TO_SIGN': {
        return (
          <MessageToSign
            injectedProvider={injectedProvider}
            paywallConfig={paywallConfig}
            send={send}
            state={state}
          />
        )
      }
      case 'MINTING': {
        return (
          <Minting
            onClose={onClose}
            injectedProvider={injectedProvider}
            paywallConfig={paywallConfig}
            send={send}
            state={state}
          />
        )
      }
      default: {
        return null
      }
    }
  }

  return (
    <Shell.Root onClose={onClose}>
      <Shell.Head
        description={description}
        title={title}
        iconURL={paywallConfig.icon!}
      />
      <Content />
    </Shell.Root>
  )
}
