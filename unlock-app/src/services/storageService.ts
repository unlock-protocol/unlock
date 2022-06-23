import { LocksmithService, WalletService } from '@unlock-protocol/unlock-js'
import { EventEmitter } from 'events'
import { decodeToken, isExpired } from 'react-jwt'
import { generateNonce } from 'siwe'
import { APP_NAME } from '../hooks/useAppStorage'
import { Lock } from '../unlockTypes'
import fetch from 'node-fetch'
// The goal of the success and failure objects is to act as a registry of events
// that StorageService will emit. Nothing should be emitted that isn't in one of
// these objects, and nothing that isn't emitted should be in one of these
// objects.
export const success = {
  addPaymentMethod: 'addPaymentMethod.success',
  storeTransaction: 'storeTransaction.success',
  getTransactionHashesSentBy: 'getTransactionHashesSentBy.success',
  getLockAddressesForUser: 'getLockAddressesForUser.success',
  storeLockDetails: 'storeLockDetails.success',
  createUser: 'createUser.success',
  updateUser: 'updateUser.success',
  getUserPrivateKey: 'getUserPrivateKey.success',
  getUserRecoveryPhrase: 'getUserRecoveryPhrase.success',
  getCards: 'getCards.success',
  keyPurchase: 'keyPurchase.success',
  ejectUser: 'ejectUser.success',
  getMetadataFor: 'getMetadataFor.success',
  getBulkMetadataFor: 'getBulkMetadataFor.success',
}

export const failure = {
  addPaymentMethod: 'addPaymentMethod.failure',
  storeTransaction: 'storeTransaction.failure',
  getTransactionHashesSentBy: 'getTransactionHashesSentBy.failure',
  getLockAddressesForUser: 'getLockAddressesForUser.failure',
  storeLockDetails: 'storeLockDetails.failure',
  createUser: 'createUser.failure',
  updateUser: 'updateUser.failure',
  getUserPrivateKey: 'getUserPrivateKey.failure',
  getUserRecoveryPhrase: 'getUserRecoveryPhrase.failure',
  getCards: 'getCards.failure',
  keyPurchase: 'keyPurchase.failure',
  ejectUser: 'ejectUser.failure',
  getMetadataFor: 'getMetadataFor.failure',
  getBulkMetadataFor: 'getBulkMetadataFor.failure',
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

  private accessToken: string | null

  private tokenKeyName = `${APP_NAME}.token`

  constructor(host: string) {
    super()
    this.host = host
    this.locksmith = new LocksmithService({
      host,
    })
    this.accessToken = null
  }

  async login(message: string, signature: string) {
    return this.locksmith.login(message, signature)
  }

  setToken(token: string) {
    this.accessToken = token
    localStorage.setItem(this.tokenKeyName, token)
    const decoded: any = decodeToken(token)
    const expireAt: number = decoded?.exp ?? -1
    if (decoded && expireAt) {
      const startTime = new Date().getTime()
      const expireTime = new Date(expireAt).getTime()
      const timeout = (startTime - expireTime) / 1000 / 60 // time difference in seconds
      setTimeout(() => {
        this.refreshToken(token)
      }, timeout)
    }
  }

  async loginPrompt({ walletService, address, chainId }: LoginPromptProps) {
    try {
      const storedToken = localStorage.getItem(this.tokenKeyName)
      if (storedToken && !isExpired(storedToken)) {
        this.setToken(storedToken)
      } else {
        const message = await this.getSiweMessage({
          address,
          chainId,
        })
        const signature = await walletService.signMessage(
          message,
          'personal_sign'
        )
        const { accessToken } = await this.login(message, signature)
        this.setToken(accessToken)
      }
    } catch (err) {
      console.error(err)
    }
  }

  get token() {
    return this.accessToken
  }

  async refreshToken(token: string) {
    return this.locksmith.refreshToken(token)
  }

  async getSiweMessage({
    address,
    chainId,
    version = '1',
  }: GetSiweMessageProps) {
    const siweMessage = LocksmithService.createSiweMessage({
      domain: 'locksmith.unlock-protocol.com',
      uri: this.host,
      address,
      chainId,
      version,
      statement: 'Authorize',
      nonce: generateNonce(),
    })
    return siweMessage.prepareMessage()
  }

  /**
   * Stores transaction hashes and the sender
   * @param {*} transactionHash
   * @param {*} senderAddress
   * @param {*} recipientAddress
   * @param {*} chain
   * @paran {*} data (input of transaction, optional)
   */
  async storeTransaction(
    transactionHash: string,
    senderAddress: string,
    recipientAddress: string,
    chain: number,
    beneficiaryAddress: string /** Used in the context of key purchase *for* */,
    data: any
  ) {
    const payload = {
      transactionHash,
      sender: senderAddress,
      for: beneficiaryAddress || senderAddress,
      recipient: recipientAddress,
      data,
      chain,
    }

    try {
      await fetch(`${this.host}/transaction`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      this.emit(success.storeTransaction, transactionHash)
    } catch (error) {
      this.emit(failure.storeTransaction, error)
    }
  }

  /**
   * Gets all the transactions sent by a given address, in the last 24 hours
   * Returns an empty array by default
   * TODO: consider a more robust url building
   * @param {*} senderAddress
   */
  async getRecentTransactionsHashesSentBy(senderAddress: string) {
    let hashes = [] // TODO This is badly named! this returns full transactions
    try {
      const oneDayAgo = new Date().getTime() - 1000 * 60 * 60 * 24
      const response = await fetch(
        `${this.host}/transactions?sender=${senderAddress}&createdAfter=${oneDayAgo}`,
        {
          method: 'GET',
        }
      )
      const data = await response.json()
      if (data && data.transactions) {
        hashes = data.transactions.map((t: any) => ({
          hash: t.transactionHash,
          network: t.chain,
          to: t.recipient,
          from: t.sender,
        }))
      }
      this.emit(success.getTransactionHashesSentBy, { senderAddress, hashes })
      return { senderAddress, hashes }
    } catch (error) {
      this.emit(failure.getTransactionHashesSentBy, error)
      return { senderAddress, hashes } // TODO: consider if thos should be an error
    }
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

  async createUser(user: any) {
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
   * Retrieves the list of known lock adresses for this user
   * [Note: locksmith may not know of all the locks by a user at a given point as the lock may not be deployed yet, or the lock might have been transfered]
   * @param {*} address
   */
  async getLockAddressesForUser(address: string) {
    try {
      const response = await fetch(`${this.host}/${address}/locks`, {
        method: 'GET',
      })
      const data = await response.json()

      if (data && data.locks) {
        this.emit(
          success.getLockAddressesForUser,
          data.locks.map((lock: Lock) => lock.address)
        )
      } else {
        this.emit(
          failure.getLockAddressesForUser,
          'We could not retrieve lock addresses for that user'
        )
      }
    } catch (error) {
      this.emit(failure.getLockAddressesForUser, error)
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
   * Given a lock address and a typed data signature, get the metadata
   * (public and protected) associated with each key on that lock.
   * @param {string} lockAddress
   * @param {string} signature
   * @param {*} data
   */
  async getBulkMetadataFor(
    lockAddress: string,
    signature: string,
    data: any,
    network: number
  ) {
    const stringData = JSON.stringify(data)
    const opts = {
      headers: {
        Authorization: `Bearer-Simple ${Buffer.from(signature).toString(
          'base64'
        )}`,
        'Content-Type': 'application/json',
      },
      // No body allowed in GET, so these are passed as query params for this
      // call.
      params: {
        data: stringData,
        signature,
      },
    }
    try {
      const response = await fetch(
        `${this.host}/api/key/${lockAddress}/keyHolderMetadata?chain=${network}`,
        {
          method: 'GET',
          body: JSON.stringify(opts.params),
          headers: {
            ...opts.headers,
          },
        }
      )
      const data = response.json()

      this.emit(success.getBulkMetadataFor, lockAddress, data)
      return data
    } catch (error) {
      this.emit(failure.getBulkMetadataFor, error)
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
      params: {
        data: JSON.stringify(data),
        signature,
      },
    }

    const response = await fetch(`${this.host}/lock/${lockAddress}/stripe`, {
      method: 'GET',
      body: JSON.stringify(opts.params),
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
    return await response?.json()
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

      return await response.json()
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
      const url = `${this.host}/api/captcha`

      const options = {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          recipients: recipients.map((r) => r.toLowerCase()),
          captchaValue,
        },
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: options.headers,
        body: JSON.stringify(options.params),
      })

      return await response.json()
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

  async getEndpoint(url: string, options: RequestInit = {}, withAuth = false) {
    const endpoint = `${this.host}${url}`
    let params = options
    if (withAuth) {
      params = {
        ...params,
        headers: {
          ...params.headers,
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    }
    return fetch(endpoint, {
      ...params,
    }).then((res) => {
      return res.json()
    })
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

  async markTicketAsCheckedIn({
    lockAddress,
    keyId,
    network,
  }: {
    lockAddress: string
    keyId: string
    network: number
  }) {
    const url = `${this.host}/v2/api/ticket/${network}/lock/${lockAddress}/key/${keyId}/check`
    return fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    })
  }

  async getVerifierStatus({
    viewer,
    network,
    lockAddress,
  }: {
    viewer: string
    network: number
    lockAddress: string
  }): Promise<boolean> {
    const options = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
    return await this.getEndpoint(
      `/v2/api/verifier/${network}/lock/${lockAddress}/address/${viewer}`,
      options,
      true
    ).then((res: any) => {
      if (res.message) {
        return false
      } else {
        return res?.enabled ?? false
      }
    })
  }
}
