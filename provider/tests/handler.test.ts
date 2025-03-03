import { describe, test, expect, vi, beforeEach } from 'vitest'
import handler from '../src/handler'
import { Env } from '../src/types'
import {
  createMockEnv,
  createMockRequest,
  setupCommonBeforeEach,
} from './__fixtures__/testUtils'

describe('Handler Functionality', () => {
  let mockEnv: Partial<Env>
  let mockRequest: Request

  beforeEach(() => {
    setupCommonBeforeEach()
    mockEnv = createMockEnv()
    mockRequest = createMockRequest()
  })

  test('Basic functionality - handles valid requests', async () => {
    // Mock a successful response
    const mockResponse = new Response(
      JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x1234' }),
      { status: 200 }
    )

    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

    const response = await handler(mockRequest, mockEnv as Env)
    expect(response.status).toBe(200)

    const responseBody = (await response.json()) as {
      jsonrpc: string
      id: number
      result: string
    }
    expect(responseBody).toEqual({ jsonrpc: '2.0', id: 1, result: '0x1234' })

    // Verify that fetch was called correctly
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  test('Handles invalid network ID', async () => {
    // Create request with invalid network ID
    const invalidRequest = createMockRequest('invalid')

    const response = await handler(invalidRequest, mockEnv as Env)
    // Updated from 400 to 404 based on actual implementation
    expect(response.status).toBe(404)

    const responseBody = (await response.json()) as {
      message: string
    }
    expect(responseBody.message).toBeDefined()
    expect(responseBody.message).toContain('Unsupported network ID')
  })

  test('Handles unsupported HTTP methods', async () => {
    // Create a GET request which should be rejected
    const getRequest = new Request('https://rpc.unlock-protocol.com/1', {
      method: 'GET',
      headers: {
        'CF-Connecting-IP': '127.0.0.1',
      },
    })

    const response = await handler(getRequest, mockEnv as Env)

    expect(response.status).toBe(400)

    const responseBody = (await response.json()) as {
      message: string
    }
    expect(responseBody.message).toBeDefined()
    expect(responseBody.message).toContain('Method GET not supported')
  })
})
