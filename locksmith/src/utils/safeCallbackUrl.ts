import { lookup } from 'dns/promises'
import net from 'net'

/**
 * Reject Locksmith outbound http(s) URLs that would hit private / link-local /
 * metadata addresses (SSRF). Used for WebSub hub.callback verification and
 * Apple Wallet pass thumbnail fetches (lock metadata.image).
 */

function ipv4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0
}

export function isBlockedIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const n = ipv4ToInt(ip)
    const inRange = (base: string, prefix: number) => {
      const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
      return (n & mask) === (ipv4ToInt(base) & mask)
    }
    return (
      inRange('0.0.0.0', 8) ||
      inRange('10.0.0.0', 8) ||
      inRange('127.0.0.0', 8) ||
      inRange('169.254.0.0', 16) ||
      inRange('172.16.0.0', 12) ||
      inRange('192.168.0.0', 16) ||
      inRange('100.64.0.0', 10)
    )
  }

  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase()
    if (normalized === '::1' || normalized === '::') return true
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true
    if (
      normalized.startsWith('fe8') ||
      normalized.startsWith('fe9') ||
      normalized.startsWith('fea') ||
      normalized.startsWith('feb')
    ) {
      return true
    }
    if (normalized.startsWith(':ffff:')) {
      const v4 = normalized.slice(':ffff:'.length)
      if (net.isIPv4(v4)) return isBlockedIp(v4)
    }
  }

  return false
}

export async function assertSafeCallbackUrl(raw: string): Promise<string> {
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    throw new Error(`callback has an invalid url "${raw}"`)
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`callback protocol must be http(s), got "${parsed.protocol}"`)
  }

  const host = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase()
  if (!host) {
    throw new Error('callback hostname is required')
  }
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) {
    throw new Error(`callback host "${host}" is not allowed`)
  }

  if (net.isIP(host)) {
    if (isBlockedIp(host)) {
      throw new Error(`callback host "${host}" is not allowed`)
    }
  } else {
    let addresses: Array<{ address: string; family: number }>
    try {
      addresses = await lookup(host, { all: true, verbatim: true })
    } catch {
      throw new Error(`callback host "${host}" could not be resolved`)
    }
    if (!addresses.length) {
      throw new Error(`callback host "${host}" could not be resolved`)
    }
    for (const { address } of addresses) {
      if (isBlockedIp(address)) {
        throw new Error(
          `callback host "${host}" resolves to blocked address "${address}"`
        )
      }
    }
  }

  return parsed.toString()
}
