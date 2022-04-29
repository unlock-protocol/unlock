import fetch from 'cross-fetch'
import { SiweMessage } from 'siwe'
import { FetchError } from './utils'

export const PRODUCTION_HOST = 'https://locksmith.unlock-protocol.com'

interface LocksmithOptions {
  host: string
  apiKey?: string
}

export class LocksmithService {
  #apiKey?: string

  #userCreditionals?: {
    accessToken: string
    refreshToken: string
  }

  public baseURL: string

  constructor(options: LocksmithOptions) {
    this.baseURL = options.host || PRODUCTION_HOST
    this.#apiKey = options.apiKey
  }

  /**
   * Helper static createSiweMessage method wrapping SIWE or sign in with ethereum standard message
   */
  static createSiweMessage(options: Partial<SiweMessage>) {
    return new SiweMessage(options)
  }

  getEndpoint(path: string) {
    return new URL(path, this.baseURL).toString()
  }

  /**
   * This will provide headers with common defaults such as content-type set to json, authentication headers such as access token and API key etc if they exist.
   * @returns - Headers
   */
  getHeaders() {
    const headers = new Headers()
    headers.set('content-type', 'application/json')
    if (this.#apiKey) {
      headers.set('Authorization', `Api-key ${this.#apiKey}`)
    } else if (this.#userCreditionals) {
      headers.set(
        'Authorization',
        `Bearer ${this.#userCreditionals.accessToken}`
      )
    }
    return headers
  }

  /**
   *
   * @param path - relative or full endpoint on the locksmith server you are calling. If relative path, it will use the base host provided.
   * @param init - fetch request
   * @returns - Fetch Response. On error, it will throw the fetch response in text form. You should catch it and parse it if it is in a different form like json.
   */
  // eslint-disable-next-line no-undef
  async request(path: string, init: RequestInit) {
    const endpoint = path.startsWith('/') ? this.getEndpoint(path) : path
    const response = await fetch(endpoint, init)
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

  /**
   *
   * @param message - Message based on EIP-4361 https://docs.login.xyz/general-information/siwe-overview/eip-4361
   * @param signature - Signature from resulting message with the wallet specified in the message.
   *
   * ```ts
   *
   * const const service = new LocksmithService()
   *  const siweMessage = LocksmithService.createSiweMessage({
   *    domain,
   *    address,
   *    statement,
   *    uri: origin,
   *    version: '1',
   *    chainId: '1'
   *  });
   *  const message = siweMessage.prepareMessage();
   *  const signature = await provider.getSigner().signMessage(message)
   *  service.login(message, signature)
   * ```
   */
  async login(message: string, signature: string) {
    const headers = this.getHeaders()
    const response = await this.request('/v2/auth/login', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        signature,
      }),
    })

    const json = await response.json()

    this.#userCreditionals = {
      accessToken: json.accessToken,
      refreshToken: json.refreshToken,
    }
  }

  /**
   * This is used to refresh the creditionals on jwt token expiration.
   */
  async creditionalsRefresh() {
    const headers = this.getHeaders()
    // If not in browser environment, set the refresh token explicitly.
    if (typeof document === 'undefined') {
      headers.set('refresh-token', this.#userCreditionals?.refreshToken!)
    }
    if (this.#userCreditionals) {
      const response = await this.request('/v2/auth/token', {
        method: 'POST',
        headers,
      })
      const json = await response.json()
      this.#userCreditionals = {
        accessToken: json.accessToken,
        refreshToken: json.refreshToken,
      }
    }
  }
}
