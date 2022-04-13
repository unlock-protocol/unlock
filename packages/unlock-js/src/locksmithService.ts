import fetch from 'cross-fetch'
import { FetchError } from './utils'

export const PRODUCTION_HOST = 'https://locksmith.unlock-protocol.com'

interface LocksmithServiceOptions {
  host?: string
}

interface Creditionals {
  accessToken: string
  refreshToken: string
  walletAddress: string
}

export class LocksmithService {
  #creditionals?: Creditionals

  public baseURL: string

  constructor(options: LocksmithServiceOptions) {
    const { host = PRODUCTION_HOST } = options
    this.baseURL = host
  }

  getEndpoint(path: string) {
    return new URL(path, this.baseURL).toString()
  }

  getHeaders() {
    const headers = new Headers()
    if (!this.#creditionals) {
      return headers
    }
    const { refreshToken, accessToken } = this.#creditionals
    headers.set('Authorization', accessToken)
    headers.set('refresh-token', refreshToken)
    return headers
  }

  // eslint-disable-next-line no-undef
  async request(input: RequestInfo, init: RequestInit) {
    const response = await fetch(input, init)
    if (!response.ok) {
      throw new FetchError({
        message: response.statusText,
        response,
        data: {
          message: await response.text(),
        },
      })
    }
    return response
  }

  async login(message: string, signature: string) {
    const headers = this.getHeaders()
    headers.set('content-type', 'application/json')

    const endpoint = this.getEndpoint('/v2/auth/login')

    const response = await this.request(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        signature,
      }),
    })

    const json = await response.json()

    this.#creditionals = {
      accessToken: json.accessToken,
      refreshToken: json.refreshToken,
      walletAddress: json.walletAddress,
    }
  }

  async creditionalsRefresh() {
    const headers = this.getHeaders()
    const endpoint = this.getEndpoint('/v2/auth/token')

    const response = await this.request(endpoint, {
      method: 'POST',
      headers,
    })

    const json = await response.json()

    this.#creditionals = {
      accessToken: json.accessToken,
      refreshToken: json.refreshToken,
      walletAddress: json.walletAddress,
    }
  }
}
