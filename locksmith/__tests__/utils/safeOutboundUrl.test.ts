import http from 'http'
import type { LookupOptions } from 'dns'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as dnsPromises from 'dns/promises'
import {
  assertSafeOutboundUrl,
  fetchSafeOutbound,
  isBlockedIp,
  safeLookup,
} from '../../src/utils/safeOutboundUrl'

vi.mock('dns/promises', () => ({
  lookup: vi.fn(async () => [{ address: '93.184.216.34', family: 4 }]),
}))

describe('safeOutboundUrl', () => {
  beforeEach(() => {
    vi.mocked(dnsPromises.lookup).mockResolvedValue([
      { address: '93.184.216.34', family: 4 },
    ] as never)
  })

  it('blocks private, benchmark, and multicast IPv4', () => {
    expect(isBlockedIp('127.0.0.1')).toBe(true)
    expect(isBlockedIp('10.0.0.5')).toBe(true)
    expect(isBlockedIp('192.168.1.1')).toBe(true)
    expect(isBlockedIp('169.254.169.254')).toBe(true)
    expect(isBlockedIp('100.64.1.1')).toBe(true)
    expect(isBlockedIp('198.18.0.1')).toBe(true)
    expect(isBlockedIp('198.19.255.1')).toBe(true)
    expect(isBlockedIp('192.0.0.8')).toBe(true)
    expect(isBlockedIp('224.0.0.1')).toBe(true)
    expect(isBlockedIp('240.0.0.1')).toBe(true)
    expect(isBlockedIp('8.8.8.8')).toBe(false)
    expect(isBlockedIp('198.20.0.1')).toBe(false)
  })

  it('unwraps IPv4-mapped IPv6, including the compressed form', () => {
    expect(isBlockedIp('::ffff:127.0.0.1')).toBe(true)
    expect(isBlockedIp('::ffff:7f00:1')).toBe(true)
    expect(isBlockedIp('::ffff:a9fe:a9fe')).toBe(true)
    expect(isBlockedIp('64:ff9b::808:808')).toBe(true)
    expect(isBlockedIp('2001:4860:4860::8888')).toBe(false)
  })

  it('rejects mapped loopback and metadata literals', async () => {
    await expect(
      assertSafeOutboundUrl('http://[::ffff:7f00:1]/')
    ).rejects.toThrow(/not allowed/)
    await expect(
      assertSafeOutboundUrl('http://[::ffff:127.0.0.1]/')
    ).rejects.toThrow(/not allowed/)
    await expect(
      assertSafeOutboundUrl('http://[::ffff:a9fe:a9fe]/')
    ).rejects.toThrow(/not allowed/)
    await expect(
      assertSafeOutboundUrl('http://localhost/hook')
    ).rejects.toThrow(/not allowed/)
  })

  it('rejects a hostname that resolves to a private address', async () => {
    vi.mocked(dnsPromises.lookup).mockResolvedValueOnce([
      { address: '10.1.1.1', family: 4 },
    ] as never)
    await expect(
      assertSafeOutboundUrl('http://rebind.example/hook')
    ).rejects.toThrow(/blocked address/)
  })

  it('allows a public host without calling the network', async () => {
    const url = await assertSafeOutboundUrl('https://example.com/websub')
    expect(url).toContain('https://example.com/websub')
    expect(dnsPromises.lookup).toHaveBeenCalled()
  })

  it('does not follow a redirect to a private address', async () => {
    const request = vi.spyOn(http, 'request').mockImplementation(((
      ...args: unknown[]
    ) => {
      const callback = args.find((arg) => typeof arg === 'function') as (
        res: unknown
      ) => void
      callback({
        statusCode: 302,
        statusMessage: 'Found',
        headers: { location: 'http://127.0.0.1/secret' },
        on(event: string, handler: () => void) {
          if (event === 'end') {
            handler()
          }
          return this
        },
      })
      return {
        on() {
          return this
        },
        write() {},
        end() {},
        destroy() {},
      }
    }) as typeof http.request)

    await expect(
      fetchSafeOutbound(
        'http://example.com/start',
        { method: 'GET' },
        { followRedirects: true }
      )
    ).rejects.toThrow(/not allowed/)
    expect(request).toHaveBeenCalledTimes(1)
    request.mockRestore()
  })

  describe('safeLookup', () => {
    const lookupWith = (options: LookupOptions) =>
      new Promise<{ err: Error | null; address?: unknown; family?: number }>(
        (resolve) => {
          safeLookup('example.com', options, (err, address, family) =>
            resolve({ err, address, family })
          )
        }
      )

    it('returns every safe address when Node asks for all of them', async () => {
      vi.mocked(dnsPromises.lookup).mockResolvedValueOnce([
        { address: '10.0.0.1', family: 4 },
        { address: '93.184.216.34', family: 4 },
        { address: '2606:2800:220:1:248:1893:25c8:1946', family: 6 },
      ] as never)
      const result = await lookupWith({ all: true })
      expect(result.err).toBeNull()
      expect(result.address).toEqual([
        { address: '93.184.216.34', family: 4 },
        { address: '2606:2800:220:1:248:1893:25c8:1946', family: 6 },
      ])
    })

    it('returns a single safe address otherwise', async () => {
      vi.mocked(dnsPromises.lookup).mockResolvedValueOnce([
        { address: '127.0.0.1', family: 4 },
        { address: '93.184.216.34', family: 4 },
      ] as never)
      const result = await lookupWith({})
      expect(result.err).toBeNull()
      expect(result.address).toBe('93.184.216.34')
      expect(result.family).toBe(4)
    })

    it('fails when every address is blocked', async () => {
      vi.mocked(dnsPromises.lookup).mockResolvedValueOnce([
        { address: '169.254.169.254', family: 4 },
      ] as never)
      const result = await lookupWith({ all: true })
      expect(result.err?.message).toMatch(/blocked address/)
    })
  })
})
