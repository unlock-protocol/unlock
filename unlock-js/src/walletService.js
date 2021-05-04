import { ethers } from 'ethers'
import UnlockService from './unlockService'
import { GAS_AMOUNTS } from './constants'
import utils from './utils'
import { generateKeyMetadataPayload } from './typedData/keyMetadata'
import { generateKeyHolderMetadataPayload } from './typedData/keyHolderMetadata'
import 'cross-fetch/polyfill'

const bytecode = require('./bytecode').default
const abis = require('./abis').default

/**
 * This service interacts with the user's wallet.
 * The functionality is on purpose only about sending transaction and returning the corresponding
 * hashes. Another service (which does not depend on the user;s wallet) will be in charge of
 * actually retrieving the data from the chain/smart contracts
 */
export default class WalletService extends UnlockService {
  /**
   * Exposes gas amount constants to be utilzed when sending relevant transactions
   * for the platform.
   */
  static gasAmountConstants() {
    return GAS_AMOUNTS
  }

  /**
   * This needs to be called with a ethers.providers which includes a signer or with a signer
   */
  async connect(provider, signer) {
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
  async _handleMethodCall(methodCall) {
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
  async updateKeyPrice(params = {}, callback) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    return version.updateKeyPrice.bind(this)(params, callback)
  }

  /**
   * Creates a lock on behalf of the user.
   * TODO: add param to let the user deploy the version they want.
   * @param {PropTypes.lock} lock
   * @param {function} callback : callback invoked with the transaction hash
   * @return Promise<PropTypes.address> lockAddress
   */
  async createLock(lock, callback) {
    const version = await this.unlockContractAbiVersion()
    return version.createLock.bind(this)(lock, callback)
  }

  async unlockContractAbiVersion() {
    return super.unlockContractAbiVersion(this.unlockAddress, this.provider)
  }

  async lockContractAbiVersion(address) {
    return super.lockContractAbiVersion(address, this.provider)
  }

  async getUnlockContract() {
    const contract = await super.getUnlockContract(
      this.unlockAddress,
      this.provider
    )
    return contract.connect(this.signer)
  }

  async getLockContract(address) {
    const contract = await super.getLockContract(address, this.provider)
    return contract.connect(this.signer)
  }

  /**
   * Deploys a new template for locks
   * It's a regular lock, but it will never work (purchase function fails)
   * It just used as template whose address is fed into configUnlock to deploy
   * locks through a proxy (keeping gas prices much lower)
   * @param {*} version
   * @param {*} callback
   */
  async deployTemplate(version, callback) {
    const factory = new ethers.ContractFactory(
      abis[version].PublicLock.abi,
      bytecode[version].PublicLock,
      this.signer
    )

    const contract = await factory.deploy({
      gasLimit: 6500000, // TODO use better value (per version?)
    })

    if (callback) {
      callback(null, contract.deployTransaction.hash)
    }
    await contract.deployed()

    return contract.address
  }

  /**
   *  Then we need to call initialize on it. This is critical because otherwise anyone can claim it and then self-destruct it, killing all locks which use the same contract after this.
   * @param {*} params
   * @param {*} callback
   */
  async initializeTemplate(params = {}, callback) {
    if (!params.templateAddress) throw new Error('Missing templateAddress')
    const version = await this.lockContractAbiVersion(params.templateAddress)
    return version.initializeTemplate.bind(this)(params, callback)
  }

  /**
   * Deploys the unlock contract and initializes it.
   * This will call the callback twice, once for each transaction
   */
  async deployUnlock(version, callback) {
    // First, deploy the contract

    const factory = new ethers.ContractFactory(
      abis[version].Unlock.abi,
      bytecode[version].Unlock,
      this.signer
    )
    const unlockContract = await factory.deploy({
      gasLimit: GAS_AMOUNTS.deployContract,
    })

    if (callback) {
      callback(null, unlockContract.deployTransaction.hash)
    }

    await unlockContract.deployed()

    // Let's now run the initialization
    const address = await this.signer.getAddress()
    const writableUnlockContract = unlockContract.connect(this.signer)
    const transaction = await writableUnlockContract.initialize(address, {
      gasLimit: 1000000,
    })

    if (callback) {
      callback(null, transaction.hash)
    }
    await this.provider.waitForTransaction(transaction.hash)
    this.unlockAddress = unlockContract.address
    return unlockContract.address
  }

  /**
   * Configures the Unlock contract by setting the following values:
   * @param {*} publicLockTemplateAddress
   * @param {*} globalTokenSymbol
   * @param {*} globalBaseTokenURI
   * @param {*} unlockDiscountToken
   * @param {*} wrappedEth
   * @param {*} estimatedGasForPurchase
   * @param {*} callback
   */
  async configureUnlock(
    {
      publicLockTemplateAddress,
      globalTokenSymbol,
      globalBaseTokenURI,
      unlockDiscountToken,
      wrappedEth,
      estimatedGasForPurchase,
    },
    callback
  ) {
    const version = await this.unlockContractAbiVersion()
    return version.configureUnlock.bind(this)(
      {
        publicLockTemplateAddress,
        globalTokenSymbol,
        globalBaseTokenURI,
        unlockDiscountToken,
        wrappedEth,
        estimatedGasForPurchase,
      },
      callback
    )
  }

  /**
   * Purchase a key to a lock by account.
   * The key object is passed so we can keep track of it from the application
   * TODO: retrieve the keyPrice, erc20Address from chain when applicable
   * - {PropTypes.address} lockAddress
   * - {PropTypes.address} owner
   * - {string} keyPrice
   * - {string} data
   * - {PropTypes.address} erc20Address
   * - {number} decimals
   * @param {function} callback : callback invoked with the transaction hash
   */
  async purchaseKey(params = {}, callback) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    return version.purchaseKey.bind(this)(params, callback)
  }

  /**
   * Grants a key to an address
   * @param {function} callback : callback invoked with the transaction hash
   */
  async grantKey(params = {}, callback) {
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
  async withdrawFromLock(params = {}, callback) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    return version.withdrawFromLock.bind(this)(params, callback)
  }

  /**
   * Signs data for the given account.
   * We favor eth_signTypedData which provides a better UI
   * In Metamask, it is called eth_signTypedData_v3
   *
   * @param {*} account
   * @param {*} data
   * @param {*} callback
   */
  async signData(account, data, callback) {
    try {
      const result = await this.unformattedSignTypedData(account, data)
      return callback(null, Buffer.from(result).toString('base64'))
    } catch (err) {
      return callback(err, null)
    }
  }

  /**
   * Tries multiple approaches for eth_signTypedData
   * @param {*} account
   * @param {*} data
   */
  async unformattedSignTypedData(account, data) {
    // Tries multiple methods because support for 'eth_signTypedData' is still fairly bad.
    const methods = {
      eth_signTypedData: (data) => data,
      eth_signTypedData_v3: (data) => JSON.stringify(data),
      eth_signTypedData_v4: (data) => JSON.stringify(data),
    }
    const toTry = Object.keys(methods)

    return new Promise((resolve, reject) => {
      // Try each
      const tryNext = async (tries) => {
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

  async signMessage(data, method) {
    const dataHash = utils.utf8ToHex(data)
    const addr = await this.signer.getAddress()
    let firstParam = dataHash
    let secondParam = addr.toLowerCase()
    if (method === 'eth_sign') {
      ;[firstParam, secondParam] = [secondParam, firstParam] // swap the parameter order
    }
    return this.provider.send(method, [firstParam, secondParam])
  }

  async signDataPersonal(account, data, callback) {
    try {
      let method = 'eth_sign'
      if (this.web3Provider || this.provider.isUnlock) {
        method = 'personal_sign'
      }
      const signature = await this.signMessage(data, method)
      callback(null, Buffer.from(signature).toString('base64'))
    } catch (error) {
      callback(error, null)
    }
  }

  /**
   * Sign and send a request to update metadata specific to a given key.
   *
   * @param {Object} params
   * @param {string} params.lockAddress - The address of the lock
   * @param {string} params.keyId - The id of the key to set metadata on
   * @param {Object.<string, string>} params.metadata - The metadata fields and values to set
   * @param {string} params.locksmithHost - A url with no trailing slash
   * @param {*} callback
   */
  async setKeyMetadata(
    { lockAddress, keyId, metadata, locksmithHost },
    callback
  ) {
    const url = `${locksmithHost}/api/key/${lockAddress}/${keyId}`
    try {
      const currentAddress = await this.getAccount()
      const payload = generateKeyMetadataPayload(currentAddress, metadata)
      const signature = await this.unformattedSignTypedData(
        currentAddress,
        payload
      )

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${Buffer.from(signature).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.status !== 202) {
        callback(
          new Error(
            `Received ${response.status} from locksmith: ${response.statusText}`
          )
        )
        return
      }
      callback(null, true)
    } catch (error) {
      callback(error, null)
    }
  }

  /**
   * @typedef {Object} keyholderMetadata
   * @property {Object.<string, string>} [publicData={}] - Publicly available metadata
   * @property {Object.<string, string>} [protectedData={}] - Restricted access metadata
   */

  /**
   * Sign and send a request to update metadata specific to a given
   * user address for a given lock.
   *
   * @param {Object} params
   * @param {string} params.lockAddress - The address of the lock
   * @param {string} params.userAddress - The address of the user (optional, defaults to current wallet user)
   * @param {keyholderMetadata} params.metadata - The metadata fields and values to set
   * @param {string} params.locksmithHost - A url with no trailing slash
   * @param {*} callback
   */
  async setUserMetadata(
    { lockAddress, userAddress, metadata, locksmithHost },
    callback
  ) {
    const url = `${locksmithHost}/api/key/${lockAddress}/user/${userAddress}`
    try {
      const currentAddress = await this.getAccount()
      const payload = generateKeyHolderMetadataPayload(currentAddress, metadata)
      const signature = await this.unformattedSignTypedData(
        currentAddress,
        payload
      )
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${Buffer.from(signature).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.status !== 202) {
        callback(
          new Error(
            `Received ${response.status} from locksmith: ${response.statusText}`
          )
        )
        return
      }
      callback(null, true)
    } catch (error) {
      callback(error, null)
    }
  }

  /**
   * Sign and send a request to read metadata specific to a given key.
   *
   * @param {Object} params
   * @param {string} params.lockAddress - The address of the lock
   * @param {string} params.keyId - The id of the key to read metadata on
   * @param {string} params.locksmithHost - A url with no trailing slash
   * @param {boolean} params.getProtectedData - when truthy, will generate signature to get protected metadata
   * @param {*} callback
   */
  async getKeyMetadata(
    { lockAddress, keyId, locksmithHost, getProtectedData },
    callback
  ) {
    const url = `${locksmithHost}/api/key/${lockAddress}/${keyId}`
    try {
      let options = {
        method: 'GET',
        accept: 'json',
      }

      if (getProtectedData) {
        const currentAddress = await this.getAccount()
        const payload = generateKeyMetadataPayload(currentAddress, {})
        const signature = await this.unformattedSignTypedData(
          currentAddress,
          payload
        )
        options.Authorization = `Bearer ${Buffer.from(signature).toString(
          'base64'
        )}`
      }

      const response = await fetch(url, options)

      const json = await response.json()
      callback(null, json)
    } catch (error) {
      callback(error, null)
    }
  }
}
