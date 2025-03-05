import { vi } from 'vitest'

// Define a type for our mocked cache functions
export interface MockedCacheStorage {
  default: {
    match: ReturnType<typeof vi.fn>
    put: ReturnType<typeof vi.fn>
  }
}

// Helper to create a mock request
export const createMockRequest = (
  networkId: string | number = '1',
  method = 'eth_blockNumber',
  params: any[] = [],
  headers: Record<string, string> = {}
) => {
  return new Request(`https://rpc.unlock-protocol.com/${networkId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CF-Connecting-IP': '127.0.0.1',
      ...headers,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  })
}

// Helper to create a request for eth_call
export const createEthCallRequest = (
  contractAddress = '0x123456789abcdef',
  data = '0x3b3b57de0000000000000000000000000000000000000000000000000000000000000000',
  networkId = '1'
) => {
  return createMockRequest(networkId, 'eth_call', [
    {
      to: contractAddress,
      data,
    },
    'latest',
  ])
}

// Import the setupMocks file
export * from './setupMocks'
