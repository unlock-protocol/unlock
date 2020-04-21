import { useState, useEffect } from 'react'
import { providers } from 'ethers'
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

export interface RemoteCall {
  method: string
  params: any[]
  callId: number
}

export interface RemoteCallResult {
  callId: number
  result: any
}

export enum CheckoutEvents {
  userInfo = 'checkout.userInfo',
  closeModal = 'checkout.closeModal',
  transactionInfo = 'checkout.transactionInfo',
  methodCall = 'checkout.methodCall',
}

type Payload = UserInfo | TransactionInfo | RemoteCall

type Emitter = (kind: CheckoutEvents, payload?: Payload) => void

interface BufferedEvent {
  kind: CheckoutEvents
  payload?: Payload
}

export class ProviderAdapter extends providers.JsonRpcProvider {
  emitMethodCall?: (call: RemoteCall) => void

  private callId = 0

  waitingMethods: { [id: number]: any } = {}

  constructor() {
    super()
  }

  async send(method: any, params: any) {
    if (typeof method !== 'string') {
      // TODO: find out why method calls come in 2 different formats
      console.error(
        new Error(`received unknown rpc method name ${JSON.stringify(method)}`)
      )
      return
    }
    console.log(`sending ${method}`)
    console.log(this.emitMethodCall)
    const callId = ++this.callId
    this.emitMethodCall!({ method, params, callId })

    const resultPromise = new Promise(resolve => {
      // TODO handle rejects
      this.waitingMethods[callId] = resolve
    })

    const result = await resultPromise
    console.log(result)
    delete this.waitingMethods[callId]
    return result
  }
}

const provider = new ProviderAdapter()

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
      console.log(`buffering ${kind}`)
      setBuffer([...buffer, { kind, payload }])
    } else {
      console.log(`emitting ${kind}`)
      parent.emit(kind, payload)
    }
  }

  const emitUserInfo = (info: UserInfo) => {
    pushOrEmit(CheckoutEvents.userInfo, info)
  }

  const emitCloseModal = () => {
    pushOrEmit(CheckoutEvents.closeModal)
  }

  const emitTransactionInfo = (info: TransactionInfo) => {
    pushOrEmit(CheckoutEvents.transactionInfo, info)
  }

  const emitMethodCall = (call: RemoteCall) => {
    pushOrEmit(CheckoutEvents.methodCall, call)
  }

  provider.emitMethodCall = emitMethodCall

  const [config, setConfig] = useState<PaywallConfig | undefined>(undefined)
  const [providerAdapter, setProviderAdapter] = useState<
    ProviderAdapter | undefined
  >(undefined)
  parent = usePostmateParent({
    setConfig: (config: PaywallConfig) => {
      setProviderAdapter(provider)
      setConfig(config)
    },
    returnMethodCallResult: ({ callId, result }: RemoteCallResult) => {
      if (provider.waitingMethods[callId]) {
        provider.waitingMethods[callId](result)
      }
    },
  })

  const insideIframe = window.parent === window.top

  // Once parent is available, we flush the buffer
  useEffect(() => {
    if (parent && buffer.length > 0) {
      console.log(buffer)
      buffer.forEach(event => {
        parent && parent.emit(event.kind, event.payload)
      })
      setBuffer([])
    }
  }, [parent, buffer])

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
