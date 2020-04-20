import { useState, useEffect } from 'react'
import Postmate from 'postmate'
import { usePostmateParent } from './usePostmateParent'
import { PaywallConfig } from '../unlockTypes'

export interface UserInfo {
  address: string
}

export interface TransactionInfo {
  hash: string
  lock?: string
}

export enum CheckoutEvents {
  userInfo = 'checkout.userInfo',
  closeModal = 'checkout.closeModal',
  transactionInfo = 'checkout.transactionInfo',
}

type Payload = UserInfo | TransactionInfo

type Emitter = (kind: CheckoutEvents, payload?: Payload) => void

interface BufferedEvent {
  kind: CheckoutEvents
  payload?: Payload
}

export class ProviderAdapter {
  private emit: Emitter

  constructor(emit: Emitter) {
    this.emit = emit
  }

  foo() {
    this.emit(CheckoutEvents.closeModal)
  }
}

// This is just a convenience hook that wraps the `emit` function
// provided by the parent around some communication helpers. If any
// events are called before the handshake completes, they go into a
// buffer. After that, once the handle to the parent is available, all
// the buffered events are emitted and future events are emitted
// directly.
export const useCheckoutCommunication = () => {
  let parent: Postmate.ChildAPI | undefined
  const [buffer, setBuffer] = useState([] as BufferedEvent[])

  const pushOrEmit: Emitter = (kind, payload) => {
    if (!parent) {
      setBuffer([...buffer, { kind, payload }])
    } else {
      parent.emit(kind, payload)
    }
  }

  const [config, setConfig] = useState<PaywallConfig | undefined>(undefined)
  const [providerAdapter, setProviderAdapter] = useState<
    ProviderAdapter | undefined
  >(undefined)
  parent = usePostmateParent({
    setConfig: (config: PaywallConfig) => {
      setProviderAdapter(new ProviderAdapter(pushOrEmit))
      setConfig(config)
    },
  })

  const insideIframe = window.parent === window.top

  // Once parent is available, we flush the buffer
  useEffect(() => {
    if (parent) {
      buffer.forEach(event => {
        parent && parent.emit(event.kind, event.payload)
      })
      setBuffer([])
    }
  }, [parent])

  const emitUserInfo = (info: UserInfo) => {
    pushOrEmit(CheckoutEvents.userInfo, info)
  }

  const emitCloseModal = () => {
    pushOrEmit(CheckoutEvents.closeModal)
  }

  const emitTransactionInfo = (info: TransactionInfo) => {
    pushOrEmit(CheckoutEvents.transactionInfo, info)
  }

  return {
    emitUserInfo,
    emitCloseModal,
    emitTransactionInfo,
    config,
    providerAdapter,
    insideIframe,
    // `ready` is primarily provided as an aid for testing the buffer
    // implementation.
    ready: !!parent,
  }
}
