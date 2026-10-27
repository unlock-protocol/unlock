import http from 'http'
import https from 'https'
import net, { type LookupFunction } from 'net'
import * as dnsPromises from 'dns/promises'

/**
 * Reject outbound http(s) URLs that would make Locksmith fetch a private,
 * link-local, or metadata address. WebSub callbacks and image fetches both
 * use this.
 */

const MAX_REDIRECTS = 3

export class BlockedOutboundUrlError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BlockedOutboundUrlError'
  }
}

function ipv4ToInt(ip: string): number {
  return (
    ip.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0
  )
}

function ipv4InRange(ip: string, base: string, prefix: number): boolean {
  const n = ipv4ToInt(ip)
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
  return (n & mask) === (ipv4ToInt(base) & mask)
}

function expandIpv6(ip: string): number[] | null {
  const bare = ip.split('%')[0].toLowerCase()
  const halves = bare.split('::')
  if (halves.length > 2) {
    return null
  }
  const expandSide = (side: string): string[] | null => {
    if (!side) {
      return []
    }
    const groups = side.split(':')
    const last = groups[groups.length - 1]
    if (!last.includes('.')) {
      return groups
    }
    const nums = last.split('.').map((part) => Number(part))
    if (
      nums.length !== 4 ||
      nums.some((n) => !Number.isInteger(n) || n > 255)
    ) {
      return null
    }
    const hi = ((nums[0] << 8) + nums[1]).toString(16)
    const lo = ((nums[2] << 8) + nums[3]).toString(16)
    return [...groups.slice(0, -1), hi, lo]
  }
  const head = expandSide(halves[0])
  const tail = halves.length === 2 ? expandSide(halves[1]) : []
  if (!head || !tail) {
    return null
  }
  const missing = 8 - (head.length + tail.length)
  if (missing < 0) {
    return null
  }
  const full = [...head, ...Array(missing).fill('0'), ...tail]
  if (full.length !== 8) {
    return null
  }
  const parsed = full.map((group) => Number.parseInt(group, 16))
  if (parsed.some((n) => !Number.isInteger(n) || n > 0xffff)) {
    return null
  }
  return parsed
}

function ipv4FromHextets(hi: number, lo: number): string {
  return `${(hi >> 8) & 255}.${hi & 255}.${(lo >> 8) & 255}.${lo & 255}`
}

export function isBlockedIp(ip: string): boolean {
  const bare = ip.split('%')[0]
  if (net.isIPv4(bare)) {
    return (
      ipv4InRange(bare, '0.0.0.0', 8) ||
      ipv4InRange(bare, '10.0.0.0', 8) ||
      ipv4InRange(bare, '127.0.0.0', 8) ||
      ipv4InRange(bare, '169.254.0.0', 16) ||
      ipv4InRange(bare, '172.16.0.0', 12) ||
      ipv4InRange(bare, '192.0.0.0', 24) ||
      ipv4InRange(bare, '192.168.0.0', 16) ||
      ipv4InRange(bare, '198.18.0.0', 15) ||
      ipv4InRange(bare, '100.64.0.0', 10) ||
      ipv4InRange(bare, '224.0.0.0', 3)
    )
  }

  if (net.isIPv6(bare)) {
    const parts = expandIpv6(bare)
    if (!parts) {
      return true
    }
    const mapped =
      parts[0] === 0 &&
      parts[1] === 0 &&
      parts[2] === 0 &&
      parts[3] === 0 &&
      parts[4] === 0 &&
      parts[5] === 0xffff
    if (mapped) {
      return isBlockedIp(ipv4FromHextets(parts[6], parts[7]))
    }
    const nat64 =
      parts[0] === 0x64 &&
      parts[1] === 0xff9b &&
      parts[2] === 0 &&
      parts[3] === 0 &&
      parts[4] === 0 &&
      parts[5] === 0
    if (nat64) {
      return true
    }
    if (parts.every((part) => part === 0)) {
      return true
    }
    if (parts.slice(0, 7).every((part) => part === 0) && parts[7] === 1) {
      return true
    }
    if ((parts[0] & 0xfe00) === 0xfc00) {
      return true
    }
    if ((parts[0] & 0xffc0) === 0xfe80) {
      return true
    }
    return false
  }

  return true
}

export async function resolveHostAddresses(host: string): Promise<string[]> {
  const addresses = await dnsPromises.lookup(host, {
    all: true,
    verbatim: true,
  })
  return addresses.map((entry) => entry.address)
}

export const safeLookup: LookupFunction = (hostname, options, callback) => {
  resolveHostAddresses(hostname)
    .then((addresses) => {
      const safe = addresses.filter((address) => !isBlockedIp(address))
      if (!safe.length) {
        callback(
          new BlockedOutboundUrlError(
            `outbound host "${hostname}" resolves to a blocked address`
          ),
          ''
        )
        return
      }
      const familyOf = (address: string) => (net.isIPv6(address) ? 6 : 4)
      // Node >= 20 asks for every address (autoSelectFamily) and expects an
      // array back; a single address there fails with ERR_INVALID_IP_ADDRESS.
      if (options.all) {
        callback(
          null,
          safe.map((address) => ({ address, family: familyOf(address) }))
        )
        return
      }
      callback(null, safe[0], familyOf(safe[0]))
    })
    .catch((error: Error) => {
      callback(error, '')
    })
}

function hostnameOf(parsed: URL): string {
  return parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase()
}

export async function assertSafeOutboundUrl(raw: string): Promise<string> {
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    throw new BlockedOutboundUrlError(`outbound url "${raw}" is invalid`)
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new BlockedOutboundUrlError(
      `outbound protocol must be http(s), got "${parsed.protocol}"`
    )
  }

  const host = hostnameOf(parsed)
  if (!host) {
    throw new BlockedOutboundUrlError('outbound hostname is required')
  }
  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local')
  ) {
    throw new BlockedOutboundUrlError(`outbound host "${host}" is not allowed`)
  }

  if (net.isIP(host)) {
    if (isBlockedIp(host)) {
      throw new BlockedOutboundUrlError(
        `outbound host "${host}" is not allowed`
      )
    }
    return parsed.toString()
  }

  let addresses: string[]
  try {
    addresses = await resolveHostAddresses(host)
  } catch {
    throw new BlockedOutboundUrlError(
      `outbound host "${host}" could not be resolved`
    )
  }
  if (!addresses.length) {
    throw new BlockedOutboundUrlError(
      `outbound host "${host}" could not be resolved`
    )
  }
  for (const address of addresses) {
    if (isBlockedIp(address)) {
      throw new BlockedOutboundUrlError(
        `outbound host "${host}" resolves to blocked address "${address}"`
      )
    }
  }
  return parsed.toString()
}

interface RequestResult {
  status: number
  statusText: string
  headers: http.IncomingHttpHeaders
  body: Buffer
}

function headerValue(
  headers: http.IncomingHttpHeaders,
  name: string
): string | undefined {
  const value = headers[name.toLowerCase()]
  if (Array.isArray(value)) {
    return value[0]
  }
  return value
}

function requestOnce(
  target: URL,
  init: {
    method?: string
    headers?: Record<string, string>
    body?: string
    signal?: AbortSignal
  }
): Promise<RequestResult> {
  return new Promise((resolve, reject) => {
    const lib = target.protocol === 'https:' ? https : http
    const req = lib.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || undefined,
        path: `${target.pathname}${target.search}`,
        method: init.method || 'GET',
        headers: init.headers,
        lookup: safeLookup,
      },
      (res) => {
        const chunks: Buffer[] = []
        res.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        })
        res.on('end', () => {
          resolve({
            status: res.statusCode || 0,
            statusText: res.statusMessage || '',
            headers: res.headers,
            body: Buffer.concat(chunks),
          })
        })
      }
    )
    const fail = (error: Error) => {
      req.destroy()
      reject(error)
    }
    req.on('error', fail)
    if (init.signal) {
      if (init.signal.aborted) {
        fail(new Error('outbound request aborted'))
        return
      }
      init.signal.addEventListener(
        'abort',
        () => fail(new Error('outbound request aborted')),
        { once: true }
      )
    }
    if (init.body) {
      req.write(init.body)
    }
    req.end()
  })
}

export interface OutboundResponse {
  ok: boolean
  status: number
  statusText: string
  blocked: boolean
  headers: { get(name: string): string | null }
  text: () => Promise<string>
  json: () => Promise<unknown>
  arrayBuffer: () => Promise<ArrayBuffer>
}

function toResponse(result: RequestResult): OutboundResponse {
  return {
    ok: result.status >= 200 && result.status < 300,
    status: result.status,
    statusText: result.statusText,
    blocked: false,
    headers: {
      get(name: string) {
        return headerValue(result.headers, name) ?? null
      },
    },
    text: async () => result.body.toString('utf8'),
    json: async () => JSON.parse(result.body.toString('utf8')),
    arrayBuffer: async () =>
      result.body.buffer.slice(
        result.body.byteOffset,
        result.body.byteOffset + result.body.byteLength
      ),
  }
}

export async function fetchSafeOutbound(
  raw: string,
  init: {
    method?: string
    headers?: Record<string, string>
    body?: string
    signal?: AbortSignal
  } = {},
  options: { followRedirects: boolean }
): Promise<OutboundResponse> {
  let current = await assertSafeOutboundUrl(raw)
  const hops = options.followRedirects ? MAX_REDIRECTS : 0
  for (let hop = 0; hop <= hops; hop++) {
    const result = await requestOnce(new URL(current), init)
    const redirected = result.status >= 300 && result.status < 400
    if (!redirected) {
      return toResponse(result)
    }
    const location = headerValue(result.headers, 'location')
    if (!options.followRedirects || hop === hops || !location) {
      throw new Error(`outbound url "${current}" redirected`)
    }
    current = await assertSafeOutboundUrl(new URL(location, current).toString())
  }
  throw new Error(`outbound url "${raw}" redirected`)
}
