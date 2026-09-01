import { describe, expect, it } from 'vitest'
import {
  assertSafeCallbackUrl,
  isBlockedIp,
} from '../../src/utils/safeCallbackUrl'

describe('safeCallbackUrl', () => {
  it('blocks loopback, private, link-local, and CGNAT IPv4', () => {
    expect(isBlockedIp('127.0.0.1')).toBe(true)
    expect(isBlockedIp('10.0.0.5')).toBe(true)
    expect(isBlockedIp('192.168.1.1')).toBe(true)
    expect(isBlockedIp('172.16.0.1')).toBe(true)
    expect(isBlockedIp('169.254.169.254')).toBe(true)
    expect(isBlockedIp('100.64.1.1')).toBe(true)
    expect(isBlockedIp('8.8.8.8')).toBe(false)
  })

  it('rejects localhost and private literal callbacks', async () => {
    await expect(
      assertSafeCallbackUrl('http://localhost/callback')
    ).rejects.toThrow(/not allowed/)
    await expect(
      assertSafeCallbackUrl('http://127.0.0.1/callback')
    ).rejects.toThrow(/not allowed/)
    await expect(
      assertSafeCallbackUrl('http://169.254.169.254/latest/meta-data/')
    ).rejects.toThrow(/not allowed/)
  })

  it('allows public https callbacks', async () => {
    const url = await assertSafeCallbackUrl('https://example.com/websub')
    expect(url).toContain('https://example.com/websub')
  })
})
