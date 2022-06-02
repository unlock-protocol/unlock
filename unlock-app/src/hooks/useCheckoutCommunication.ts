import { useState, useEffect } from 'react'
import { usePostmateParent } from './usePostmateParent'
import { PaywallConfig } from '../unlockTypes'

export interface UserInfo {
  address?: string
  signedMessage?: string
}

export interface TransactionInfo {
  hash: string
  lock?: string
}

export enum CheckoutEvents {
  enable = 'checkout.enable',
  userInfo = 'checkout.userInfo',
  closeModal = 'checkout.closeModal',
  transactionInfo = 'checkout.transactionInfo',
  methodCall = 'checkout.methodCall',
  onEvent = 'checkout.onEvent',
}

type Payload = UserInfo | TransactionInfo | MethodCall | string

interface BufferedEvent {
  kind: CheckoutEvents
  payload?: Payload
}

export interface MethodCall {
  method: string
  params: any
  id: number
}

export interface MethodCallResult {
  id: number
  response?: any
  error?: any
}

// Taken from https://github.com/ethers-io/ethers.js/blob/master/src.ts/providers/web3-provider.ts
export type AsyncSendable = {
  enable: () => void
  isMetaMask?: boolean
  host?: string
  path?: string
  sendAsync?: (
    request: any,
    callback: (error: any, response: any) => void
  ) => void
  send?: (request: any, callback: (error: any, response: any) => void) => void
  on?: (name: string, callback: () => void) => void
}

// Callbacks from method calls that have been sent to the parent
// iframe are held here, once the parent iframe has resolved the call
// it will trigger the callback and remove it from the table.
export const waitingMethodCalls: {
  [id: number]: (error: any, response: any) => void
} = {}
// TODO: see if we can support multiple handlers for same event name
export const eventHandlers: {
  [name: string]: () => void
} = {}

// Defaults to no-op
let enabled: (value?: unknown) => void = (_: unknown) => {}

export const resolveMethodCall = (result: MethodCallResult) => {
  const callback = waitingMethodCalls[result.id]
  if (!callback) {
    console.error(
      `Received a method call result for unknown method: ${JSON.stringify(
        result
      )}`
    )
    return
  }
  delete waitingMethodCalls[result.id]
  callback(result.error, result.response)
}

export const resolveOnEnable = () => {
  enabled()
}

export const resolveOnEvent = (name: string) => {
  const callback = eventHandlers[name]
  if (callback) {
    callback()
  }
}

// This is just a convenience hook that wraps the `emit` function
// provided by the parent around some communication helpers. If any
// events are called before the handshake completes, they go into a
// buffer. After that, once the handle to the parent is available, all
// the buffered events are emitted and future events are emitted
// directly.
export const useCheckoutCommunication = () => {
  const [providerAdapter, setProviderAdapter] = useState<
    AsyncSendable | undefined
  >(undefined)
  const [buffer, setBuffer] = useState([] as BufferedEvent[])
  const [config, setConfig] = useState<PaywallConfig | undefined>(undefined)
  const parent = usePostmateParent({
    setConfig: (config: PaywallConfig) => {
      setConfig(config)
    },
    resolveMethodCall,
    resolveOnEvent,
    resolveOnEnable,
  })

  let insideIframe = false

  const pushOrEmit = (kind: CheckoutEvents, payload?: Payload) => {
    if (!parent) {
      setBuffer([...buffer, { kind, payload }])
    } else {
      parent.emit(kind, payload)
    }
  }

  // Once parent is available, we flush the buffer
  useEffect(() => {
    if (parent && buffer.length > 0) {
      buffer.forEach((event) => {
        parent.emit(event.kind, event.payload)
      })
      setBuffer([])
    }
  }, [parent, buffer])

  const emitUserInfo = (info: UserInfo) => {
    pushOrEmit(CheckoutEvents.userInfo, info)
  }

  const emitCloseModal = () => {
    pushOrEmit(CheckoutEvents.closeModal)
  }

  const emitTransactionInfo = (info: TransactionInfo) => {
    pushOrEmit(CheckoutEvents.transactionInfo, info)
  }

  const emitMethodCall = (call: MethodCall) => {
    pushOrEmit(CheckoutEvents.methodCall, call)
  }

  const emitEnable = () => {
    pushOrEmit(CheckoutEvents.enable)
  }

  const emitOnEvent = (eventName: string) => {
    pushOrEmit(CheckoutEvents.onEvent, eventName)
  }

  // If the page is not inside an iframe, window and window.top will be identical
  if (typeof window !== 'undefined') {
    insideIframe = window.top !== window
  }

  if (config && config.useDelegatedProvider && !providerAdapter) {
    setProviderAdapter({
      enable: () => {
        return new Promise((resolve) => {
          enabled = resolve
          emitEnable()
        })
      },
      sendAsync: (request: MethodCall, callback) => {
        waitingMethodCalls[request.id] = (error: any, response: any) => {
          callback(error, response)
        }
        emitMethodCall(request)
      },
      on: (event: string, callback: any) => {
        eventHandlers[event] = callback
        emitOnEvent(event)
      },
    })
  }

  return {
    emitUserInfo,
    emitCloseModal,
    emitTransactionInfo,
    emitMethodCall,
    paywallConfig: config,
    providerAdapter,
    insideIframe,
    // `ready` is primarily provided as an aid for testing the buffer
    // implementation.
    ready: !!parent,
  }
}
