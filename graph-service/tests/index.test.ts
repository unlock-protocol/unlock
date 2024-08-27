import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Env } from '../src/types'
import worker from '../src/index'

// Mock environment variables to simulate different network configurations
const mockEnv: Env = {
  BASE_URL: 'https://api.example.com/query/12345',
  NETWORK_MAINNET: 'test-mainnet',
  NETWORK_OPTIMISM: 'test-optimism',
  NETWORK_POLYGON: 'test-polygon',
  NETWORK_ARBITRUM: 'test-arbitrum',
  NETWORK_BSC: 'test-bsc',
  NETWORK_GNOSIS: 'test-gnosis',
  NETWORK_AVALANCHE: 'test-avalanche',
  NETWORK_SEPOLIA: 'test-sepolia',
  NETWORK_BASE: 'test-base',
  NETWORK_CELO: 'test-celo',
  NETWORK_GOERLI: 'test-goerli',
  NETWORK_ARBITRUM_GOERLI: 'test-arbitrum-goerli',
  NETWORK_BASE_SEPOLIA: 'test-base-sepolia',
  NETWORK_CELO_ALFAJORES: 'test-celo-alfajores',
  NETWORK_AVALANCHE_FUJI: 'test-avalanche-fuji',
}

// Grouping tests related to the graph service
describe('Graph Service', () => {
  // Reset mocks before each test to ensure clean state
  beforeEach(() => {
    vi.resetAllMocks()
  })

  // Test case for unsupported network requests
  it('should return 400 for unsupported network', async () => {
    const request = new Request('https://example.com/unsupported-network', {
      method: 'POST',
    })
    const response = await worker.fetch(request, mockEnv)
    // Expect a 400 status and the appropriate error message
    expect(response.status).toBe(400)
    expect(await response.text()).toBe(
      'Unsupported network: unsupported-network'
    )
  })

  // Test case for handling non-POST requests
  it('should return 405 for non-POST requests', async () => {
    const request = new Request('https://example.com/mainnet', {
      method: 'GET',
    })
    const response = await worker.fetch(request, mockEnv)
    // Expect a 405 status for method not allowed
    expect(response.status).toBe(405)
    expect(await response.text()).toBe('Method Not Allowed')
  })

  // Test case for missing GraphQL query in the request
  it('should return 400 for missing query', async () => {
    const request = new Request('https://example.com/mainnet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const response = await worker.fetch(request, mockEnv)
    // Expect a 400 status and the appropriate error message
    expect(response.status).toBe(400)
    expect(await response.text()).toBe('Bad Request: query is required')
  })

  // Test case for forwarding requests to the correct subgraph
  it('should forward request to correct subgraph and return response', async () => {
    const mockQuery = '{ locks { address } }'
    const mockResponse = { data: { locks: [{ address: '0x123' }] } }

    // Mock the global fetch function to simulate a successful response
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const request = new Request('https://example.com/mainnet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: mockQuery }),
    })

    const response = await worker.fetch(request, mockEnv)

    // Expect a 200 status and the correct response data
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(mockResponse)
    // Verify that the fetch was called with the correct URL and options
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/query/12345/test-mainnet/version/latest',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ query: mockQuery }),
      })
    )
  })

  // Test case for handling errors during fetch
  it('should handle errors and return 500', async () => {
    // Mock the global fetch function to simulate a network error
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const request = new Request('https://example.com/mainnet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ locks { address } }' }),
    })

    const response = await worker.fetch(request, mockEnv)

    // Expect a 500 status for internal server error
    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Internal Server Error')
  })
})
