import { vi, describe, beforeAll, beforeEach, expect, it } from 'vitest'
import pingPoap from '../../utils/poap'

describe('pingPoap', () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  it('should ping the poap server with the right data', () => {
    expect.assertions(3)
    fetch.mockResponseOnce(JSON.stringify({ data: '' }))
    const owner = '0xowner'
    const key = {
      lock: {
        address: '0xlock',
      },
    }
    const signature = 'signature'
    const timestamp = 123
    pingPoap(key, owner, signature, timestamp)
    expect(fetch.mock.calls.length).toEqual(1)
    expect(fetch.mock.calls[0][0]).toEqual('https://api.poap.xyz/tasks/')
    expect(fetch.mock.calls[0][1]).toEqual({
      body: '{"accountAddress":"0xowner","lockAddress":"0xlock","timestamp":123,"signature":"signature"}',
      headers: {
        Accept: 'application/json',
        Authorization: 'a75495d2-c9c5-494c-9ba4-80976b371bae',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
  })

  it('should not fail if fetch failed', () => {
    expect.assertions(2)
    const owner = '0xowner'
    const key = {
      lock: {
        address: '0xlock',
      },
    }
    const signature = 'signature'
    const timestamp = 123
    const consoleSpy = vi.spyOn(global.console, 'error')
    fetch.mockReject(() => {
      throw new Error('fake error message')
    })
    expect(() => pingPoap(key, owner, signature, timestamp)).not.toThrow()
    expect(consoleSpy).toHaveBeenCalled()
  })
})
