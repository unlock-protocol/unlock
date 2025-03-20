import { describe, test, expect, beforeEach, vi } from 'vitest'
import {
  getResponseFromKV,
  storeResponseInKV,
  getCachedResponseForRequest,
} from '../src/cache'
import { RpcRequest, Env } from '../src/types'
import * as utils from '../src/utils'

describe('Cache Module', () => {
  const dummyRequest: RpcRequest = {
    id: 1,
    jsonrpc: '2.0',
    method: 'eth_call',
    params: [{ to: '0x1234' }],
  }
  const dummyResponse = { id: 1, jsonrpc: '2.0', result: '0xresult' }
  const chainId = '1'
  let env: Partial<Env>

  beforeEach(() => {
    env = {
      REQUEST_CACHE: {
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        list: vi.fn(),
        getWithMetadata: vi.fn(),
      },
    }
  })

  test('getResponseFromKV returns value if found as json', async () => {
    ;(env.REQUEST_CACHE!.get as any).mockResolvedValue({ result: '0xcached' })
    const result = await getResponseFromKV(dummyRequest, chainId, env as Env)
    expect(result).toEqual({ result: '0xcached' })
  })

  test('getResponseFromKV falls back to text if json fails and parses text', async () => {
    ;(env.REQUEST_CACHE!.get as any)
      .mockRejectedValueOnce(new Error('json error'))
      .mockResolvedValueOnce('{"result": "0xcachedText"}')
    const result = await getResponseFromKV(dummyRequest, chainId, env as Env)
    expect(result).toEqual({ result: '0xcachedText' })
  })

  test('getResponseFromKV deletes entry if text parsing fails', async () => {
    ;(env.REQUEST_CACHE!.get as any)
      .mockRejectedValueOnce(new Error('json error'))
      .mockResolvedValueOnce('invalid json')
    await getResponseFromKV(dummyRequest, chainId, env as Env)
    expect(env.REQUEST_CACHE!.delete).toHaveBeenCalled()
  })

  test('storeResponseInKV calls put when response is valid', async () => {
    await storeResponseInKV(dummyRequest, dummyResponse, chainId, env as Env)
    expect(env.REQUEST_CACHE!.put).toHaveBeenCalled()
  })

  test('getCachedResponseForRequest returns formatted response when cache exists and request is cacheable', async () => {
    vi.spyOn(utils, 'isNameResolutionRequest').mockReturnValue(true)
    ;(env.REQUEST_CACHE!.get as any).mockResolvedValue({ result: '0xcached' })

    const result = await getCachedResponseForRequest(
      dummyRequest,
      chainId,
      env as Env
    )
    expect(result).toEqual({
      id: dummyRequest.id,
      jsonrpc: dummyRequest.jsonrpc,
      result: '0xcached',
    })
  })

  test('getCachedResponseForRequest returns null if request is not cacheable', async () => {
    vi.spyOn(utils, 'isNameResolutionRequest').mockReturnValue(false)
    ;(env.REQUEST_CACHE!.get as any).mockResolvedValue({ result: '0xcached' })

    const result = await getCachedResponseForRequest(
      dummyRequest,
      chainId,
      env as Env
    )
    expect(result).toBeNull()
  })
})
