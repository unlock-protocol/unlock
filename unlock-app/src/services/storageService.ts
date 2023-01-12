import {
  WalletService,
  LocksmithService,
  LocksmithServiceConfiguration,
} from '@unlock-protocol/unlock-js'

import { EventEmitter } from 'events'
import { isExpired } from 'react-jwt'
import { generateNonce } from 'siwe'
import fetch from 'node-fetch'
import { APP_NAME } from '~/hooks/useAppStorage'

// The goal of the success and failure objects is to act as a registry of events
// that StorageService will emit. Nothing should be emitted that isn't in one of
// these objects, and nothing that isn't emitted should be in one of these
// objects.
export const success = {
  addPaymentMethod: 'addPaymentMethod.success',
  createUser: 'createUser.success',
  updateUser: 'updateUser.success',
  getUserPrivateKey: 'getUserPrivateKey.success',
  getUserRecoveryPhrase: 'getUserRecoveryPhrase.success',
  getCards: 'getCards.success',
  keyPurchase: 'keyPurchase.success',
  ejectUser: 'ejectUser.success',
}

export const failure = {
  addPaymentMethod: 'addPaymentMethod.failure',
  createUser: 'createUser.failure',
  updateUser: 'updateUser.failure',
  getUserPrivateKey: 'getUserPrivateKey.failure',
  getUserRecoveryPhrase: 'getUserRecoveryPhrase.failure',
  getCards: 'getCards.failure',
  keyPurchase: 'keyPurchase.failure',
  ejectUser: 'ejectUser.failure',
}

interface GetSiweMessageProps {
  address: string
  chainId: number
  version?: string
}

interface LoginPromptProps {
  address: string
  chainId: number
  walletService: WalletService
}
export class StorageService extends EventEmitter {
  public host: string

  public locksmith: LocksmithService

  constructor(host: string) {
    super()
    this.host = host
    this.locksmith = new LocksmithService(
      new LocksmithServiceConfiguration({
        basePath: host,
      })
    )
  }

  loginRequest = false

  async login(message: string, signature: string) {
    const response = await this.locksmith.login({
      message,
      signature,
    })

    if (response.status !== 200) {
      throw new Error('login failed')
    }

    const { refreshToken, accessToken } = response.data

    this.refreshToken = refreshToken
    this.#accessToken = accessToken
  }

  async signOut() {
    try {
      const endpoint = `${this.host}/v2/auth/revoke`
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'refresh-token': this.refreshToken!,
        },
      })
      this.#accessToken = null
      this.refreshToken = null
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
      }
    }
  }

  async loginPrompt({ walletService, address, chainId }: LoginPromptProps) {
    if (this.loginRequest) {
      return
    }
    this.loginRequest = true
    try {
      const refreshToken = this.refreshToken
      if (refreshToken) {
        await this.getAccessToken()
      } else {
        const message = await this.getSiweMessage({
          address,
          chainId,
        })
        const signature = await walletService.signMessage(
          message,
          'personal_sign'
        )
        await this.login(message, signature)
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message)
      }
    }
    this.loginRequest = false
  }

  #accessToken: null | string = null

  get refreshToken() {
    return localStorage.getItem(`${APP_NAME}.refresh-token`)
  }

  set refreshToken(refreshToken: string | null) {
    if (refreshToken) {
      localStorage.setItem(`${APP_NAME}.refresh-token`, refreshToken)
    } else {
      localStorage.removeItem(`${APP_NAME}.refresh-token`)
    }
  }

  get isAuthenticated() {
    const accessToken = this.#accessToken
    const refreshToken = this.refreshToken
    return Boolean(accessToken && refreshToken && !isExpired(accessToken))
  }

  async getAccessToken() {
    const refreshToken = this.refreshToken
    if (!refreshToken) {
      throw new Error('User is not authenticated')
    }
    if (!this.#accessToken || isExpired(this.#accessToken)) {
      const { data, status } = await this.locksmith.refreshToken(refreshToken)
      if (status !== 200) {
        throw new Error('Could not get access token')
      }
      this.#accessToken = data.accessToken
    }
    return this.#accessToken
  }

  async getSiweMessage({
    address,
    chainId,
    version = '1',
  }: GetSiweMessageProps) {
    const siweMessage = LocksmithService.createSiweMessage({
      domain: window.location.hostname,
      uri: window.location.origin,
      address,
      chainId,
      version,
      statement: '',
      nonce: generateNonce(),
    })
    return siweMessage.prepareMessage()
  }

  genAuthorizationHeader(token: string) {
    return { Authorization: ` Bearer ${token}` }
  }

  /**
   * Creates a user. In the case of failure a rejected promise is returned to
   * the caller.  On success, the encrypted key payload and the credentials are
   * emitted so that the user can automatically be signed in.
   *
   * @param {*} user
   * @param {string} emailAddress (do not send to locksmith)
   * @param {string} password (do not send to locksmith)
   * @returns {Promise<*>}
   */

  async createUser(user: any): Promise<any> {
    return fetch(`${this.host}/users/`, {
      method: 'POST',
      body: JSON.stringify(user),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  /**
   * Updates a user's private key, using their email address as key. In the case
   * of failure a rejected promise is returned to the caller.
   *
   * @param {*} email
   * @param {*} user
   * @param {*} token
   * @returns {Promise<*>}
   */
  async updateUserEncryptedPrivateKey(
    emailAddress: string,
    user: string,
    token: string
  ) {
    const opts = {
      headers: {
        ...this.genAuthorizationHeader(token),
        ...{ 'Content-Type': 'application/json' },
      },
    }
    try {
      await fetch(
        `${this.host}/users/${encodeURIComponent(
          emailAddress
        )}/passwordEncryptedPrivateKey`,
        {
          method: 'PUT',
          body: JSON.stringify(user),
          headers: opts.headers,
        }
      )
      this.emit(success.updateUser, { emailAddress, user })
    } catch (error) {
      this.emit(failure.updateUser, { emailAddress, error })
    }
  }

  /**
   * Adds a payment method to a user's account, using their email address as key.
   *
   * @param {*} emailAddress
   * @param {*} paymentDetails structured_data used to generate signature
   * @param {*} token
   */
  async addPaymentMethod(
    emailAddress: string,
    stripeTokenId: string,
    token: string
  ) {
    const opts = {
      headers: this.genAuthorizationHeader(token),
    }
    try {
      await fetch(
        `${this.host}/users/${encodeURIComponent(emailAddress)}/paymentdetails`,
        {
          method: 'PUT',
          body: JSON.stringify(stripeTokenId),
          headers: opts.headers,
        }
      )
      this.emit(success.addPaymentMethod, { emailAddress, stripeTokenId })
    } catch (error) {
      this.emit(failure.addPaymentMethod, { emailAddress, error })
    }
  }

  /**
   * Given a user's email address, retrieves their private key. In the case of failure a rejected promise
   * is returned to the caller.
   * @param {*} emailAddress
   * @param {*} token
   * @returns {Promise<*>}
   */
  async getUserPrivateKey(emailAddress: string) {
    const opts = {}
    try {
      const response = await fetch(
        `${this.host}/users/${encodeURIComponent(emailAddress)}/privatekey`,
        { method: 'GET', headers: opts }
      )
      const data = await response.json()

      if (data && data.passwordEncryptedPrivateKey) {
        this.emit(success.getUserPrivateKey, {
          emailAddress,
          passwordEncryptedPrivateKey: data.passwordEncryptedPrivateKey,
        })
        // We also return from this one so that we can use the value directly to
        // avoid passing the password around too much.
        return data.passwordEncryptedPrivateKey
      }
    } catch (error) {
      this.emit(failure.getUserPrivateKey, { emailAddress, error })
    }
  }

  /**
   * Given a user's email address, retrieves their recovery phrase. In the case of failure a rejected promise
   * is returned to the caller.
   * @param {*} emailAddress
   * @param {*} token
   * @returns {Promise<*>}
   */
  async getUserRecoveryPhrase(emailAddress: string) {
    const opts = {}
    try {
      const response = await fetch(
        `${this.host}/users/${encodeURIComponent(emailAddress)}/recoveryphrase`,
        { method: 'GET', headers: opts }
      )
      const data = await response.json()

      if (data && data.recoveryPhrase) {
        const { recoveryPhrase } = data
        this.emit(success.getUserRecoveryPhrase, {
          emailAddress,
          recoveryPhrase,
        })
        return {
          emailAddress,
          recoveryPhrase,
        }
      }
    } catch (error) {
      this.emit(failure.getUserRecoveryPhrase, { emailAddress, error })
      return {}
    }
  }

  /**
   * Given a user's email address, retrieves the payment methods associated with
   * their account. Except in event of error, will always respond with an array
   * of 0 or more elements.
   */
  async getCards(emailAddress: string) {
    try {
      const response = await fetch(
        `${this.host}/users/${encodeURIComponent(emailAddress)}/cards`,
        { method: 'GET' }
      )
      const data = await response.json()
      this.emit(success.getCards, data)
    } catch (error) {
      this.emit(failure.getCards, { error })
    }
  }

  async purchaseKey(purchaseRequest: Record<string, any>, token: string) {
    const opts = {
      headers: {
        ...this.genAuthorizationHeader(token),
        ...{ 'Content-Type': 'application/json' },
      },
    }
    try {
      const response = await fetch(`${this.host}/purchase`, {
        method: 'POST',
        body: JSON.stringify(purchaseRequest),
        headers: opts.headers,
      })
      const data = await response.json()

      this.emit(
        success.keyPurchase,
        purchaseRequest.message.purchaseRequest.lock
      )
      return data.transactionHash
    } catch (error) {
      this.emit(failure.keyPurchase, error)
    }
  }

  /**
   * Ejects a user
   *
   * @param {*} publicKey
   * @param {*} data structured_data used to generate signature
   * @param {*} token
   */
  async ejectUser(publicKey: string, data: any, token: string) {
    const opts = {
      headers: {
        ...this.genAuthorizationHeader(token),
        ...{ 'Content-Type': 'application/json' },
      },
    }
    try {
      await fetch(`${this.host}/users/${publicKey}/eject`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { ...opts.headers, ...{ 'Content-Type': 'application/json' } },
      })
      this.emit(success.ejectUser, { publicKey })
    } catch (error) {
      this.emit(failure.ejectUser, { publicKey })
    }
  }

  /**
   * Given a lock address and a typed data signature, connect to stripe
   * @param {string} lockAddress
   * @param {string} signature
   * @param {*} data
   */
  async getStripeConnect(lockAddress: string, signature: string, data: any) {
    const opts = {
      headers: {
        Authorization: `Bearer-Simple ${Buffer.from(signature).toString(
          'base64'
        )}`,
        'Content-Type': 'application/json',
      },
    }

    const url = new URL(`${this.host}/lock/${lockAddress}/stripe`)
    url.searchParams.append('data', JSON.stringify(data))
    url.searchParams.append('signature', signature)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...opts.headers,
      },
    })
    return response.json()
  }

  async updateLockIcon(
    lockAddress: string,
    signature: string,
    data: any,
    icon: any
  ) {
    const opts = {
      headers: {
        Authorization: `Bearer-Simple ${Buffer.from(signature).toString(
          'base64'
        )}`,
        'Content-Type': 'application/json',
      },
    }
    const response = await fetch(`${this.host}/lock/${lockAddress}/icon`, {
      method: 'POST',
      body: JSON.stringify({ ...data, icon }),
      headers: {
        ...opts.headers,
      },
    })
    return response.ok
  }

  /**
   * Saves a user metadata for a lock
   * @param {*} lockAddress
   * @param {*} userAddress
   * @param {*} payload
   * @param {*} signature
   * @param {*} network
   * @returns
   */
  async setUserMetadataData(
    lockAddress: string,
    userAddress: string,
    payload: any,
    signature: string,
    network: number
  ) {
    let url = `${this.host}/api/key/${lockAddress}/user/${userAddress}`
    if (network) {
      url = `${url}?chain=${network}`
    }

    return fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer-Simple ${Buffer.from(signature).toString(
          'base64'
        )}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  }

  /**
   * Saves a key metadata for a lock
   * @param {*} lockAddress
   * @param {*} userAddress
   * @param {*} payload
   * @param {*} signature
   * @param {*} network
   * @returns
   */
  async setKeyMetadata(
    lockAddress: string,
    keyId: string,
    payload: any,
    signature: string,
    network: number
  ) {
    let url = `${this.host}/api/key/${lockAddress}/${keyId}`
    if (network) {
      url = `${url}?chain=${network}`
    }

    return fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${Buffer.from(signature).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  }

  /**
   *
   * @param {*} lockAddress
   * @param {*} keyId
   * @param {*} payload
   * @param {*} signature
   * @param {*} network
   * @returns
   */
  async getKeyMetadata(
    lockAddress: string,
    keyId: string,
    // @ts-ignore
    payload: any,
    signature: string,
    network: number
  ) {
    try {
      let url = `${this.host}/api/key/${lockAddress}/${keyId}`
      if (network) {
        url = `${url}?chain=${network}`
      }

      const options: { headers: Record<string, string> } = {
        headers: {
          'Content-Type': 'application/json',
        },
      }
      if (signature) {
        options.headers.Authorization = `Bearer ${Buffer.from(
          signature
        ).toString('base64')}`
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: options.headers,
      })

      const json = await response.json()
      return json
    } catch (error) {
      console.error(error)
      return {}
    }
  }

  async getDataForRecipientsAndCaptcha(
    recipients: string[],
    captchaValue: string
  ) {
    try {
      const url = new URL(`${this.host}/api/captcha`)
      const rs = recipients.map((r) => r.toLowerCase())
      const options = {
        headers: {
          'Content-Type': 'application/json',
        },
      }

      for (const r of rs) {
        url.searchParams.append('recipients[]', r)
      }

      url.searchParams.append('captchaValue', captchaValue)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: options.headers,
      })

      const json = await response.json()
      return json
    } catch (error) {
      console.error(error)
      return {}
    }
  }

  async getKeyGranter(network: number) {
    try {
      const url = `${this.host}/purchase`

      const options = {
        headers: {
          'Content-Type': 'application/json',
        },
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: options.headers,
      })
      const data = await response.json()

      return data[network].address
    } catch (error) {
      console.error(error)
      return ''
    }
  }

  async userExist(emailAddress: string) {
    try {
      const endpoint = `${this.host}/users/${emailAddress}`

      const response = await fetch(endpoint, {
        method: 'GET',
      })
      return response.status === 200
    } catch (error) {
      return false
    }
  }

  async submitMetadata(
    users: {
      userAddress: string
      metadata: {
        public?: Record<string, string>
        protected?: Record<string, string>
      }
      lockAddress: string
    }[],
    network: number
  ) {
    const url = `${this.host}/v2/api/metadata/${network}/users`
    const opts = {
      method: 'POST',
      body: JSON.stringify({ users }),
      headers: {
        'content-type': 'application/json',
      },
    }
    const response = await fetch(url, opts)
    return response.json()
  }

  async canClaimMembership({
    network,
    lockAddress,
  }: {
    lockAddress: string
    network: number
  }) {
    const response = await fetch(
      `${this.host}/claim/${network}/locks/${lockAddress}`
    )
    const json = await response.json()
    if (response.ok) {
      return !!json?.canClaim
    }
    return false
  }
}
