import { useState, useEffect, useCallback } from 'react'
import { usePostmateParent } from './usePostmateParent'
import { PaywallConfigType } from '@unlock-protocol/core'
import { OAuthConfig } from '~/unlockTypes'
import { useProvider } from './useProvider'
import { config as AppConfig } from '~/config/app'
export interface UserInfo {
  address?: string
  signedMessage?: string
  message?: string
}

export interface TransactionInfo {
  hash: string
  lock?: string
  metadata?: any
  tokenIds?: string[]
  network?: number
}

export enum CheckoutEvents {
  enable = 'checkout.enable',
  userInfo = 'checkout.userInfo',
  closeModal = 'checkout.closeModal',
  transactionInfo = 'checkout.transactionInfo',
  metadata = 'checkout.metadata',
  methodCall = 'checkout.methodCall',
  onEvent = 'checkout.onEvent',
  resolveMethodCall = 'checkout.resolveMethodCall',
  resolveOnEventCall = 'checkout.resolveOnEventCall',
}

type Payload = UserInfo | TransactionInfo | MethodCall | any

interface BufferedEvent {
  kind: CheckoutEvents
  payload?: Payload
}

export interface MethodCall {
  method: string
  params: any
  id: string
}

export interface MethodCallResult {
  id: number
  response?: any
  error?: any
}

// Taken from https://github.com/ethers-io/ethers.js/blob/master/src.ts/providers/web3-provider.ts
export type AsyncSendable = {
  parentOrigin: () => string
  enable: () => void
  sendAsync?: (
    request: any,
    callback: (error: any, response: any) => void
  ) => void
  request?: (
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
  [id: string]: (error: any, response: any) => void
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

export const resolveOnEnable = (accounts: string[]) => {
  enabled(accounts)
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
// outgoingBuffer. After that, once the handle to the parent is available,
// all the buffered events are emitted and future events are emitted
// directly.
export const useCheckoutCommunication = () => {
  const [providerAdapter, setProviderAdapter] = useState<
    AsyncSendable | undefined
  >(undefined)
  const [outgoingBuffer, setOutgoingBuffer] = useState([] as BufferedEvent[])
  const [incomingBuffer, setIncomingBuffer] = useState([] as MethodCall[])
  const [paywallConfig, setPaywallConfig] = useState<
    PaywallConfigType | undefined
  >(undefined)
  const [oauthConfig, setOauthConfig] = useState<OAuthConfig | undefined>(
    undefined
  )
  const { provider } = useProvider(AppConfig)
  const [user, setUser] = useState<string | undefined>(undefined)

  const pushOrEmit = (kind: CheckoutEvents, payload?: Payload) => {
    if (!parent) {
      setOutgoingBuffer([...outgoingBuffer, { kind, payload }])
    } else {
      parent.emit(kind, payload)
    }
  }

  // Handler for messages from the parent
  const handleMethodCallEvent = useCallback(
    async ({ id, params, method }: MethodCall) => {
      if (!provider) {
        setIncomingBuffer([...incomingBuffer, { id, params, method }])
      } else if (provider.send) {
        return provider
          .send(method, params)
          .then((response: unknown) => {
            pushOrEmit(CheckoutEvents.resolveMethodCall, {
              id,
              error: null,
              response,
            })
          })
          .catch((error: Error) => {
            pushOrEmit(CheckoutEvents.resolveMethodCall, {
              id,
              error,
              response: null,
            })
          })
      } else {
        pushOrEmit(CheckoutEvents.resolveMethodCall, {
          id,
          error:
            'unknown method to call provider! Please make sure you use and EIP1193 provider!',
          response: null,
        })
      }
    },
    [incomingBuffer, provider, pushOrEmit]
  )

  const parent = usePostmateParent({
    setConfig: (config: PaywallConfigType) => {
      setPaywallConfig(config)
      setOauthConfig(undefined)
    },
    authenticate: (config: any) => {
      setOauthConfig({
        clientId: config?.clientId,
        responseType: config?.responseType ?? '',
        state: config?.state ?? '',
        redirectUri: config?.redirectUri ?? '',
      })
      setPaywallConfig(undefined)
    },
    resolveMethodCall,
    resolveOnEvent,
    resolveOnEnable,
    handleMethodCallEvent,
    handleOnEvent: async (eventName: string) => {
      if (!provider) {
        return
      }
      return provider.on(eventName, () => {
        pushOrEmit(CheckoutEvents.resolveOnEventCall, eventName)
      })
    },
  })

  // Once parent is available, we flush the outgoingBuffer
  useEffect(() => {
    if (parent && outgoingBuffer.length > 0) {
      outgoingBuffer.forEach((event) => {
        parent.emit(event.kind, event.payload)
      })
      setOutgoingBuffer([])
    }
  }, [parent, outgoingBuffer])

  // Once provider is available, we flush the incomingBuffer
  useEffect(() => {
    if (provider && incomingBuffer.length > 0) {
      incomingBuffer.forEach(({ id, params, method }) => {
        handleMethodCallEvent({ id, params, method })
      })
      setIncomingBuffer([])
    }
  }, [provider, incomingBuffer, handleMethodCallEvent])

  const emitUserInfo = (info: UserInfo) => {
    // if user already emitted, avoid re-emitting
    if (info.address === user && !info.signedMessage) {
      return
    }
    setUser(info.address)
    pushOrEmit(CheckoutEvents.userInfo, info)
  }

  const emitMetadata = (metadata: any) => {
    pushOrEmit(CheckoutEvents.metadata, metadata)
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
  let insideIframe = false
  if (typeof window !== 'undefined') {
    insideIframe = window.top !== window
  }

  const useDelegatedProvider =
    paywallConfig?.useDelegatedProvider || oauthConfig?.useDelegatedProvider

  if (useDelegatedProvider && !providerAdapter) {
    setProviderAdapter({
      parentOrigin: () => {
        // @ts-expect-error Property 'parentOrigin' does not exist on type 'ChildAPI'.ts(2339)
        return parent?.parentOrigin
      },
      enable: () => {
        return new Promise((resolve) => {
          enabled = resolve
          emitEnable()
        })
      },
      sendAsync: (request: MethodCall, callback) => {
        if (!request.id) {
          request.id = window.crypto.randomUUID()
        }
        waitingMethodCalls[request.id] = (error: any, response: any) => {
          callback(error, response)
        }
        emitMethodCall(request)
      },
      request: async (request: MethodCall) => {
        if (!request.id) {
          // Assigning an id because they may be returned in a different order
          try {
            request.id = window.crypto.randomUUID()
          } catch (error) {
            console.error(error)
            request.id = Math.floor(Math.random() * 100000000).toString() // fallback
          }
        }
        return new Promise((resolve, reject) => {
          waitingMethodCalls[request.id] = (error: any, response: any) => {
            if (error) {
              reject(error)
            } else {
              resolve(response)
            }
          }
          emitMethodCall(request)
        })
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
    emitMetadata,
    emitMethodCall,
    paywallConfig,
    oauthConfig,
    providerAdapter,
    insideIframe,
    // `ready` is primarily provided as an aid for testing the buffer
    // implementation.
    ready: !!parent,
  }
}

export type CheckoutCommunication = ReturnType<typeof useCheckoutCommunication>
