import { PostMessageToIframe } from './setupIframeMailbox'
import { MessageTypes, PostMessages } from '../messageTypes'
import { web3MethodCall } from '../windowTypes'

export interface UnvalidatedPayload {
  method?: any
  id?: any
  params?: any
  jsonrpc?: '2.0'
}

export function validateMethodCall(payload: UnvalidatedPayload) {
  if (!payload || typeof payload !== 'object') return false
  if (!payload.method || typeof payload.method !== 'string') {
    return false
  }
  if (!payload.params || !Array.isArray(payload.params)) {
    return false
  }
  if (typeof payload.id !== 'number' || Math.round(payload.id) !== payload.id) {
    return false
  }
  return true
}

/**
 * This is the fake web3 provider we use for user accounts. It knows only
 * 2 kinds of method calls, account and network.
 */
export function proxyProvider({
  payload,
  proxyAccount,
  proxyNetwork,
  postMessage,
}: {
  payload: UnvalidatedPayload
  proxyAccount: string | null
  proxyNetwork: string | number
  postMessage: PostMessageToIframe<MessageTypes>
}) {
  if (!validateMethodCall(payload)) return
  const { method, id } = payload as web3MethodCall
  switch (method) {
    case 'eth_accounts':
      postMessage('data', PostMessages.WEB3_RESULT, {
        id,
        jsonrpc: '2.0',
        result: { id, jsonrpc: '2.0', result: [proxyAccount] },
      })
      break
    case 'net_version':
      postMessage('data', PostMessages.WEB3_RESULT, {
        id,
        jsonrpc: '2.0',
        result: { id, jsonrpc: '2.0', result: proxyNetwork },
      })
      break
    default:
      postMessage('data', PostMessages.WEB3_RESULT, {
        id,
        jsonrpc: '2.0',
        error: `"${method}" is not supported`,
      })
  }
}
