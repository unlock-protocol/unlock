import { ethers } from 'ethers'
import { Lock, WalletServiceCallback } from './types'
import UnlockService from './unlockService'
import utils from './utils'

/**
 * This service interacts with the user's wallet.
 * The functionality is on purpose only about sending transaction and returning the corresponding
 * hashes. Another service (which does not depend on the user;s wallet) will be in charge of
 * actually retrieving the data from the chain/smart contracts
 */
export default class WalletService extends UnlockService {
  /**
   * This needs to be called with a ethers.providers which includes a signer or with a signer
   */
  async connect(provider: ethers.providers.Provider, signer: ethers.Signer) {
    this.provider = provider
    if (signer) {
      this.signer = signer
    } else {
      this.signer = this.provider.getSigner(0)
    }

    const { chainId: networkId } = await this.provider.getNetwork()

    if (this.networkId !== networkId) {
      this.networkId = networkId
    }

    if (!this.networks[networkId]) {
      throw new Error(`Missing config for ${networkId}`)
    }
    if (this.networks[networkId].unlockAddress) {
      this.unlockAddress = this.networks[networkId].unlockAddress
    }
    return networkId
  }

  /**
   * Function which yields the address of the account on the provider
   */
  async getAccount() {
    const accounts = await this.provider.listAccounts()

    if (!accounts.length) {
      // We do not have an account, can't do anything until we have one.
      return null
    }

    const address = accounts[0]

    return address
  }

  /**
   * This function submits a web3 transaction and will trigger an event as soon as it receives its
   * hash. We then use the web3Service to handle the ongoing transaction (watch for confirmation
   * receipt... etc)
   * A the moment the dispatcher relies on the strict emission, it is imperitive that the emission
   * of these fields not change for the time being!
   * @private
   * @param {Promise} the result of calling a contract method (ethersjs contract)
   * @param {string} the Unlock protocol transaction type
   * @param {Function} a standard node callback that accepts the transaction hash
   */
  // eslint-disable-next-line no-underscore-dangle
  // TODO: Do we need this???
  async _handleMethodCall(methodCall: any) {
    const transaction = await methodCall
    if (transaction.hash) {
      return transaction.hash
    }
    // TODO: Transaction sent thru a JSON RPC endpoint will take a little time to get the hash
    // So we have to wait for it.
    const finalTransaction = await transaction.wait()
    return finalTransaction.hash
    // errors fall through
  }

  /**
   * Updates the key price on a lock
   * @param {PropTypes.address} lockAddress : address of the lock for which we update the price
   * @param {string} price : new price for the lock
   * @param {function} callback : callback invoked with the transaction hash
   * @return Promise<PropTypes.number> newKeyPrice
   */
  async updateKeyPrice(
    params: { lockAddress: string },
    callback: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    return version.updateKeyPrice.bind(this)(params, callback)
  }

  /**
   * Creates a lock on behalf of the user.
   * @param {PropTypes.lock} lock
   * @param {function} callback : callback invoked with the transaction hash
   * @return Promise<PropTypes.address> lockAddress
   */
  async createLock(
    lock: Lock,
    callback: WalletServiceCallback
  ): Promise<string> {
    const version = await this.unlockContractAbiVersion()
    if (lock && typeof lock.publicLockVersion !== 'undefined' && version < 11) {
      throw new Error('Lock creation at version only available for lock v11+')
    }
    return version.createLock.bind(this)(lock, callback)
  }

  async unlockContractAbiVersion() {
    return super.unlockContractAbiVersion(this.unlockAddress, this.provider)
  }

  async lockContractAbiVersion(address: string) {
    return super.lockContractAbiVersion(address, this.provider)
  }

  async getUnlockContract() {
    const contract = await super.getUnlockContract(
      this.unlockAddress,
      this.provider
    )
    return contract.connect(this.signer)
  }

  async getLockContract(address: string) {
    const contract = await super.getLockContract(address, this.provider)
    return contract.connect(this.signer)
  }

  /**
   *  Then we need to call initialize on it. This is critical because otherwise anyone can claim it and then self-destruct it, killing all locks which use the same contract after this.
   * @param {*} params
   * @param {*} callback
   */
  async initializeTemplate(
    params: {
      templateAddress: string
    },
    callback: WalletServiceCallback
  ) {
    if (!params.templateAddress) throw new Error('Missing templateAddress')
    const version = await this.lockContractAbiVersion(params.templateAddress)
    return version.initializeTemplate.bind(this)(params, callback)
  }

  /**
   * Purchase a key to a lock by account.
   * The key object is passed so we can keep track of it from the application
   * - {PropTypes.address} lockAddress
   * - {PropTypes.address} owner
   * - {string} keyPrice
   * - {string} data
   * - {PropTypes.address} erc20Address
   * - {number} decimals
   * @param {function} callback : callback invoked with the transaction hash
   */
  async purchaseKey(
    params: {
      lockAddress: string
      owner?: string
      keyPrice?: string
      data?: string
      erc20Address?: string
      decimals?: number
    },
    callback: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    return version.purchaseKey.bind(this)(params, callback)
  }

  /**
   * Purchase several keys to a lock by account.
   * The key object is passed so we can keep track of it from the application
   * - {PropTypes.address} lockAddress
   * - {PropTypes.arrayOf(PropTypes.address)} owners
   * - {PropTypes.arrayOf(string)} keyPrices
   * - {PropTypes.arrayOf(string)} data
   * - {PropTypes.address} erc20Address
   * - {number} decimals
   * @param {function} callback : callback invoked with the transaction hash
   */
  async purchaseKeys(
    params: {
      lockAddress: string
      owners?: [string]
      keyPrices?: [string]
      data?: [string]
      erc20Address?: string
      decimals?: number
    },
    callback: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    return version.purchaseKeys.bind(this)(params, callback)
  }

  /**
   * Extends an expired key
   * @param {*} params
   * @param {*} callback
   */
  async extendKey(
    params: {
      lockAddress: string
      tokenId: string
    },
    callback: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.cancelAndRefund) {
      throw new Error('Lock version not supported')
    }
    return version.extendKey.bind(this)(params, callback)
  }

  /**
   * Purchase key function. This implementation requires the following
   * @param {object} params:
   * - {PropTypes.address} lockAddress
   * - {number} tokenIdFrom
   * - {number} tokenIdTo
   * - {number} amount if null, will take the entire remaining time of the from key
   * @param {function} callback invoked with the transaction hash
   */
  async mergeKeys(
    params: {
      lockAddress: string
      tokenIdFrom: string
      tokenIdTo: string
      amount?: number
    },
    callback: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.mergeKeys) {
      throw new Error('Lock version not supported')
    }
    return version.mergeKeys.bind(this)(params, callback)
  }

  /**
   * Grants permission to grant keys to address
   * @param {*} params
   * @param {*} callback
   */
  async addKeyGranter(
    params: {
      lockAddress: string
      keyGranter: string
    },
    callback: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    if (!params.keyGranter) throw new Error('Missing account')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.addKeyGranter) {
      throw new Error('Lock version not supported')
    }
    return version.addKeyGranter.bind(this)(params, callback)
  }

  /**
   * Expire and refunds (optional) a key by lock manager
   * @param {*} params
   * @param {*} callback
   */
  async expireAndRefundFor(
    params: {
      lockAddress: string
      keyOwner: string // deprec from lock v10+
      tokenId: string // support from lock v10+
      amount?: string
      decimals?: number
      erc20Address?: string
    },
    callback: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    if (!params.keyOwner) throw new Error('Missing keyOwner')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.expireAndRefundFor) {
      throw new Error('Lock version not supported')
    }
    return version.expireAndRefundFor.bind(this)(params, callback)
  }

  /**
   * Cancels a membership and receive a refund (called by key manager)
   * @param {*} params
   * @param {*} callback
   */
  async cancelAndRefund(
    params: {
      lockAddress: string
      tokenId: string
    },
    callback: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.cancelAndRefund) {
      throw new Error('Lock version not supported')
    }
    return version.cancelAndRefund.bind(this)(params, callback)
  }

  /**
   * Shares a key by transfering time from key to another key
   * @param {*} params
   * - {PropTypes.address} lockAddress
   * - {PropTypes.address } recipient
   * - {string}: tokenId the token to share time from
   * - {string}: duration time to share in seconds
   * @param {*} callback
   */
  async shareKey(
    params: {
      lockAddress: string
      recipient: string
      tokenId: string
      duration?: string
    },
    callback: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    if (!params.recipient) throw new Error('Missing recipient')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.shareKey) {
      throw new Error('Lock version not supported')
    }
    return version.shareKey.bind(this)(params, callback)
  }

  /**
   * Grants a key to an address
   * @param {function} callback : callback invoked with the transaction hash
   */
  async grantKey(
    params: {
      lockAddress: string
      recipient: string
      expiration?: string
      transactionOptions?: unknown
    },
    callback: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    return version.grantKey.bind(this)(params, callback)
  }

  /**
   * Triggers a transaction to withdraw funds from the lock and assign them to the owner.
   * @param {object} params
   * - {PropTypes.address} lockAddress
   * - {string} amount
   * @param {function} callback : callback invoked with the transaction hash
   */
  async withdrawFromLock(
    params: {
      lockAddress: string
      amount?: string
      decimals?: number
      erc20Address?: string
    },
    callback: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    return version.withdrawFromLock.bind(this)(params, callback)
  }

  /**
   * Tries multiple approaches for eth_signTypedData
   * @param {*} account
   * @param {*} data
   */
  async unformattedSignTypedData(account: string, data: any) {
    // Tries multiple methods because support for 'eth_signTypedData' is still fairly bad.
    const methods: Record<string, (data: any) => string> = {
      eth_signTypedData: (data: any) => data,
      eth_signTypedData_v3: (data: any) => JSON.stringify(data),
      eth_signTypedData_v4: (data: any) => JSON.stringify(data),
    }
    const toTry = Object.keys(methods)

    return new Promise((resolve, reject) => {
      // Try each
      const tryNext = async (tries: string[]): Promise<unknown> => {
        const method = tries.shift()
        if (!method) {
          // They all failed
          return reject(new Error('All signing method failed'))
        }
        try {
          const sendData = methods[method](data)
          const result = await this.provider.send(method, [account, sendData])
          if (result) {
            return resolve(result)
          }
        } catch (error) {
          console.error(`Method ${method} not supported by provider.`)
          console.error(error)
        }
        return tryNext(tries)
      }

      tryNext(toTry)
    })
  }

  async signMessage(data: any, method: any) {
    const dataHash = utils.utf8ToHex(data)
    const addr = await this.signer.getAddress()
    let firstParam = dataHash
    let secondParam = addr.toLowerCase()
    if (method === 'eth_sign') {
      ;[firstParam, secondParam] = [secondParam, firstParam] // swap the parameter order
    }
    return this.provider.send(method, [firstParam, secondParam])
  }

  async signDataPersonal(
    account: string,
    data: any,
    callback: WalletServiceCallback
  ) {
    try {
      let method = 'eth_sign'
      if (this.web3Provider || this.provider.isUnlock) {
        method = 'personal_sign'
      }
      const signature = await this.signMessage(data, method)
      callback(null, Buffer.from(signature).toString('base64'))
    } catch (error) {
      if (error instanceof Error) {
        callback(error, null)
      }
    }
  }

  async setMaxNumberOfKeys(
    params: {
      lockAddress: string
      maxNumbeOfKeys: string
    },
    callback: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.setMaxNumberOfKeys) {
      throw new Error('Lock version not supported')
    }
    return version.setMaxNumberOfKeys.bind(this)(params, callback)
  }

  async setMaxKeysPerAddress(
    params: {
      lockAddress: string
      maxKeysPerAddress: string
    },
    callback: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.setMaxKeysPerAddress) {
      throw new Error('Lock version not supported')
    }
    return version.setMaxKeysPerAddress.bind(this)(params, callback)
  }

  async setExpirationDuration(
    params: {
      lockAddress: string
      expirationDuration: number
    },
    callback: WalletServiceCallback
  ) {
    if (!params.lockAddress) {
      throw new Error('Missing lockAddress')
    }

    if (params.expirationDuration && params.expirationDuration < 1) {
      throw new Error('Expiration duration must be greater than 0')
    }

    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.setExpirationDuration) {
      throw new Error('Lock version not supported')
    }
    return version.setExpirationDuration.bind(this)(params, callback)
  }

  async getCancelAndRefundValueFor(
    params: {
      lockAddress: string
      owner: string
      tokenAddress: string
    },
    callback: WalletServiceCallback
  ) {
    if (!params.lockAddress) {
      throw new Error('Missing lockAddress')
    }
    if (!params.owner) {
      throw new Error('Missing owner')
    }
    if (!params.tokenAddress) {
      throw new Error('Missing tokenAddress')
    }
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.getCancelAndRefundValueFor) {
      throw new Error('Lock version not supported')
    }

    return version.getCancelAndRefundValueFor.bind(this)(params, callback)
  }
}
