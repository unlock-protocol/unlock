import { useState, useEffect } from 'react'
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
  methodCall = 'checkout.methodCall',
}

type Payload = UserInfo | TransactionInfo | MethodCall

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
  isMetaMask?: boolean
  host?: string
  path?: string
  sendAsync?: (
    request: any,
    callback: (error: any, response: any) => void
  ) => void
  send?: (request: any, callback: (error: any, response: any) => void) => void
}

// Callbacks from method calls that have been sent to the parent
// iframe are held here, once the parent iframe has resolved the call
// it will trigger the callback and remove it from the table.
export const waitingMethodCalls: {
  [id: number]: (error: any, response: any) => void
} = {}

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
  })

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

  // If the page is not inside an iframe, window and window.top will be identical
  const insideIframe = window.top !== window

  if (config && config.useDelegatedProvider && !providerAdapter) {
    setProviderAdapter({
      sendAsync: (request: MethodCall, callback) => {
        waitingMethodCalls[request.id] = (error: any, response: any) => {
          callback(error, response)
        }
        emitMethodCall(request)
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
