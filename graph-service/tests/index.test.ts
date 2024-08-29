import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Env } from '../src/types'
import worker from '../src/index'

// Mock environment variables to simulate different network configurations
const mockEnv: Env = {
  MAINNET_SUBGRAPH: 'test-mainnet',
  OPTIMISM_SUBGRAPH: 'test-optimism',
  POLYGON_SUBGRAPH: 'test-polygon',
  ARBITRUM_SUBGRAPH: 'test-arbitrum',
  BSC_SUBGRAPH: 'test-bsc',
  GNOSIS_SUBGRAPH: 'test-gnosis',
  AVALANCHE_SUBGRAPH: 'test-avalanche',
  SEPOLIA_SUBGRAPH: 'test-sepolia',
  BASE_SUBGRAPH: 'test-base-subgraph',
  CELO_SUBGRAPH: 'test-celo-subgraph',
  LINEA_SUBGRAPH: 'test-linea-subgraph',
  SCROLL_SUBGRAPH: 'test-scroll-subgraph',
  ZKSYNC_SUBGRAPH: 'test-zksync-subgraph',
  ZKEVM_SUBGRAPH: 'test-zkevm-subgraph',
}

// Grouping tests related to the graph service
describe('Graph Service', () => {
  // Reset mocks before each test to ensure clean state
  beforeEach(() => {
    vi.resetAllMocks()
  })

  // Test for unsupported network
  it('should return 400 for unsupported network', async () => {
    const request = new Request('https://example.com/999999', {
      method: 'POST',
    })
    const response = await worker.fetch(request, mockEnv)
    expect(response.status).toBe(400)
    expect(await response.text()).toBe('Unsupported network ID: 999999')
  })

  // Test for non-POST requests
  it('should return 405 for non-POST requests', async () => {
    const request = new Request('https://example.com/1', {
      method: 'GET',
    })
    const response = await worker.fetch(request, mockEnv)
    expect(response.status).toBe(405)
    expect(await response.text()).toBe('Method Not Allowed')
  })

  // Test for missing query
  it('should return 400 for missing query', async () => {
    const request = new Request('https://example.com/1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const response = await worker.fetch(request, mockEnv)
    expect(response.status).toBe(400)
    expect(await response.text()).toBe('Bad Request: query is required')
  })

  // Test for forwarding request to correct subgraph
  it('should forward request to correct subgraph and return response', async () => {
    const mockQuery = '{ locks { address } }'
    const mockResponse = { data: { locks: [{ address: '0x123' }] } }

    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const request = new Request('https://example.com/1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: mockQuery }),
    })

    const response = await worker.fetch(request, mockEnv)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(mockResponse)
    expect(global.fetch).toHaveBeenCalledWith(
      mockEnv.MAINNET_SUBGRAPH,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ query: mockQuery }),
      })
    )
  })

  // Test for handling errors
  it('should handle errors and return 500', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const request = new Request('https://example.com/1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ locks { address } }' }),
    })

    const response = await worker.fetch(request, mockEnv)

    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Internal Server Error')
  })
})
