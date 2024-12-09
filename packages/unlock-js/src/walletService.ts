import { ethers } from 'ethers'
import { WalletServiceCallback, TransactionOptions } from './types'
import UnlockService from './unlockService'
import utils from './utils'
import { passwordHookAbi } from './abis/passwordHookAbi'
import { passwordCapHookAbi } from './abis/passwordCapHookAbi'
import { discountCodeHookAbi } from './abis/discountCodeHookAbi'
import { discountCodeWithCapHookAbi } from './abis/discountCodeWithCapHookAbi'
import { allowListHookAbi } from './abis/allowListHookAbi'
import { signTransferAuthorization } from './erc20'
import { CardPurchaser } from './CardPurchaser'

import type {
  CreateLockOptions,
  PurchaseKeyParams,
  PurchaseKeysParams,
  ExtendKeyParams,
  GetAndSignAuthorizationsForTransferAndPurchaseParams,
  PurchaseWithCardPurchaserParams,
} from './params'

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
  async connect(provider: ethers.JsonRpcProvider, signer?: ethers.Signer) {
    this.provider = provider
    if (signer) {
      this.signer = signer
    } else {
      this.signer = await this.provider.getSigner()
    }
    const { chainId: networkId } = await this.provider.getNetwork()

    if (this.networkId !== networkId) {
      this.networkId = networkId
    }

    if (this.networks[networkId]?.unlockAddress) {
      this.unlockAddress = this.networks[networkId].unlockAddress
    }
    return networkId
  }

  /**
   * Function which yields the address of the account on the provider
   */
  async getAccount() {
    const account = await this.provider.getSigner(0)

    const address = await account.getAddress()

    if (!address) {
      // We do not have an account, can't do anything until we have one.
      return null
    }

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
    params: { lockAddress: string; keyPrice: string },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    return version.updateKeyPrice.bind(this)(
      params,
      transactionOptions,
      callback
    )
  }

  /**
   * Creates a lock on behalf of the user.
   * @param {PropTypes.lock} lock
   * @param {function} callback : callback invoked with the transaction hash
   * @return Promise<PropTypes.address> lockAddress
   */
  async createLock(
    lock: CreateLockOptions,
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ): Promise<string> {
    const version = await this.unlockContractAbiVersion()
    if (lock && typeof lock.publicLockVersion !== 'undefined' && version < 11) {
      throw new Error('Lock creation at version only available for lock v11+')
    }
    return version.createLock.bind(this)(lock, transactionOptions, callback)
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
    return contract.connect(this.signer) as ethers.Contract
  }

  async getLockContract(address: string) {
    const contract = await super.getLockContract(address, this.provider)
    return contract.connect(this.signer) as ethers.Contract
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
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.templateAddress) throw new Error('Missing templateAddress')
    const version = await this.lockContractAbiVersion(params.templateAddress)
    return version.initializeTemplate.bind(this)(
      params,
      transactionOptions,
      callback
    )
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
    params: PurchaseKeyParams,
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    return version.purchaseKey.bind(this)(params, transactionOptions, callback)
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
    params: PurchaseKeysParams,
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    return version.purchaseKeys.bind(this)(params, transactionOptions, callback)
  }

  /**
   * Function to renew a membership, callable by anyone.
   * This is only useful for ERC20 locks for which the key owner has approved
   * a large enough token amount!
   * @param params
   * @param callback
   * @returns
   */
  async renewMembershipFor(
    params: { lockAddress: string; referrer: string | null; tokenId: string },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    if (!params.tokenId) throw new Error('Missing tokenId')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    return version.renewMembershipFor.bind(this)(
      params,
      transactionOptions,
      callback
    )
  }

  /**
   * Extends an expired key
   * @param {*} params
   * @param {*} callback
   */
  async extendKey(
    params: ExtendKeyParams,
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    const lockContract = await this.getLockContract(params.lockAddress)

    if (!(params.tokenId || params.owner)) {
      throw new Error('Missing tokenId or owner')
    }

    // if the lock is not v10+, we need to purchase a key to extend it.
    if (!version.extendKey) {
      const owner = params.owner
        ? params.owner
        : await lockContract.ownerOf(params.tokenId)

      return this.purchaseKey.bind(this)(
        {
          owner,
          ...params,
        },
        transactionOptions,
        callback
      )
    }

    if (!params.tokenId && params.owner) {
      const id = await lockContract.tokenOfOwnerByIndex(params.owner, 0)
      params.tokenId = id.toString()
    }

    return version.extendKey.bind(this)(params, transactionOptions, callback)
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
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.mergeKeys) {
      throw new Error('Lock version not supported')
    }
    return version.mergeKeys.bind(this)(params, transactionOptions, callback)
  }

  /**
   * Set ERC20 allowance to the beneficary
   * @param {object} params:
   * - {PropTypes.address} lockAddress
   * - {string} spender the address of the spender
   * - {number} amount the amount to approve
   * @param {function} callback invoked with the transaction hash
   */
  async approveBeneficiary(
    params: {
      lockAddress: string
      spender: string
      amount: number
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.approveBeneficiary) {
      throw new Error('Lock version not supported')
    }
    return version.approveBeneficiary.bind(this)(
      params,
      transactionOptions,
      callback
    )
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
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    if (!params.keyGranter) throw new Error('Missing account')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.addKeyGranter) {
      throw new Error('Lock version not supported')
    }
    return version.addKeyGranter.bind(this)(
      params,
      transactionOptions,
      callback
    )
  }

  /**
   * Revokes permission to grant keys to an address
   * @param {*} params
   * @param {*} callback
   */
  async removeKeyGranter(
    params: {
      lockAddress: string
      keyGranter: string
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    if (!params.keyGranter) throw new Error('Missing account')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.removeKeyGranter) {
      throw new Error('Lock version not supported')
    }
    return version.removeKeyGranter.bind(this)(
      params,
      transactionOptions,
      callback
    )
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
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    if (!params.keyOwner) throw new Error('Missing keyOwner')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.expireAndRefundFor) {
      throw new Error('Lock version not supported')
    }
    return version.expireAndRefundFor.bind(this)(
      params,
      transactionOptions,
      callback
    )
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
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.cancelAndRefund) {
      throw new Error('Lock version not supported')
    }
    return version.cancelAndRefund.bind(this)(
      params,
      transactionOptions,
      callback
    )
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
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    if (!params.recipient) throw new Error('Missing recipient')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.shareKey) {
      throw new Error('Lock version not supported')
    }
    return version.shareKey.bind(this)(params, transactionOptions, callback)
  }

  /**
   * Lends a key to another address
   * @param {function} callback : callback invoked with the transaction hash
   */

  async lendKey(
    params: {
      lockAddress: string
      from: string
      to: string
      tokenId: string
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.lendKey) {
      throw new Error('Lock version not supported')
    }
    return version.lendKey.bind(this)(params, transactionOptions, callback)
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
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    return version.grantKey.bind(this)(params, transactionOptions, callback)
  }

  /**
   * Grant keys to multiple recipient addresses with custom expiration
   * @param {function} callback : callback invoked with the transaction hash
   */
  async grantKeys(
    params: {
      lockAddress: string
      recipients: string[]
      expirations?: string[]
      keyManagers?: string[]
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) {
      throw new Error('Missing lockAddress')
    }
    const version = await this.lockContractAbiVersion(params.lockAddress)
    return version.grantKeys.bind(this)(params, transactionOptions, callback)
  }

  /**
   * Grant key extension. This implementation requires the following
   * @param {object} params:
   * - {PropTypes.address} lockAddress
   * - {number} tokenId
   * - {number} duration default to 0, which will extend the key by the
   *  default duration of the lock
   * @param {function} callback invoked with the transaction hash
   */
  async grantKeyExtension(
    params: {
      lockAddress: string
      tokenId: string
      duration: number
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.grantKeyExtension) {
      throw new Error('Lock version not supported')
    }
    return version.grantKeyExtension.bind(this)(
      params,
      transactionOptions,
      callback
    )
  }

  /**
   * Update the name of a lock
   * @param {object} params:
   * - {PropTypes.address} lockAddress
   * - {string} name the new name of the lock
   * @param {function} callback invoked with the transaction hash
   */
  async updateLockName(
    params: {
      lockAddress: string
      name: string
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.updateLockName) {
      throw new Error('Lock version not supported')
    }
    return version.updateLockName.bind(this)(
      params,
      transactionOptions,
      callback
    )
  }

  /**
   * Update the symbol of a lock
   * @param {object} params:
   * - {PropTypes.address} lockAddress
   * - {string} symbol the new symbol of the lock
   * @param {function} callback invoked with the transaction hash
   */
  async updateLockSymbol(
    params: {
      lockAddress: string
      symbol: string
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.updateLockSymbol) {
      throw new Error('Lock version not supported')
    }
    return version.updateLockSymbol.bind(this)(
      params,
      transactionOptions,
      callback
    )
  }

  /**
   * Update the base URI used to parse the tokenURI
   * @param {object} params:
   * - {PropTypes.address} lockAddress
   * - {string} baseTokenURI the new baseTokenURI of the lock
   * @param {function} callback invoked with the transaction hash
   */
  async setBaseTokenURI(
    params: {
      lockAddress: string
      baseTokenURI: string
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.setBaseTokenURI) {
      throw new Error('Lock version not supported')
    }
    return version.setBaseTokenURI.bind(this)(
      params,
      transactionOptions,
      callback
    )
  }

  /**
   * Triggers a transaction to withdraw funds from the lock and assign them to the owner.
   * @param {object} params
   * - {PropTypes.address} lockAddress
   * - {string} amount the amount to withdraw (0 to withdraw the entire balance)
   * - {string} Erc20Address the address of the ERC20 currency to withdraw
   * - {number} decimals the number of decimals of the ERC20
   * - {string} beneficary the address that will receive the funds (only v12+)
   * @param {function} callback : callback invoked with the transaction hash
   */
  async withdrawFromLock(
    params: {
      lockAddress: string
      amount?: string
      decimals?: number
      erc20Address?: string
      beneficiary?: string
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    return version.withdrawFromLock.bind(this)(
      params,
      transactionOptions,
      callback
    )
  }

  /**
   * Tries multiple approaches for eth_signTypedData
   * @param {*} account
   * @param {*} data
   */
  async unformattedSignTypedData(account: string, data: any) {
    // Tries multiple methods because support for 'eth_signTypedData' is still fairly bad.
    const methods: Record<string, (_data: any) => string> = {
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

  async setMaxNumberOfKeys(
    params: {
      lockAddress: string
      maxNumberOfKeys: string
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.setMaxNumberOfKeys) {
      throw new Error('Lock version not supported')
    }
    return version.setMaxNumberOfKeys.bind(this)(
      params,
      transactionOptions,
      callback
    )
  }

  async setMaxKeysPerAddress(
    params: {
      lockAddress: string
      maxKeysPerAddress: string
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.setMaxKeysPerAddress) {
      throw new Error('Lock version not supported')
    }
    return version.setMaxKeysPerAddress.bind(this)(
      params,
      transactionOptions,
      callback
    )
  }

  async setExpirationDuration(
    params: {
      lockAddress: string
      expirationDuration: number | string
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) {
      throw new Error('Missing lockAddress')
    }

    if (
      params.expirationDuration &&
      typeof params.expirationDuration === 'number' &&
      params.expirationDuration < 1
    ) {
      throw new Error('Expiration duration must be greater than 0')
    }

    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.setExpirationDuration) {
      throw new Error('Lock version not supported')
    }
    return version.setExpirationDuration.bind(this)(
      params,
      transactionOptions,
      callback
    )
  }

  /**
   * Add lock manager to Contact
   * @param {*} params
   * @param {*} callback
   */
  async addLockManager(
    params: {
      lockAddress: string
      userAddress: string
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    if (!params.userAddress) throw new Error('Missing userAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.addLockManager) {
      throw new Error('Lock version not supported')
    }
    return version.addLockManager.bind(this)(
      params,
      transactionOptions,
      callback
    )
  }

  /**
   * Renounce lock manager status for Contract
   * @param {*} params
   * @param {*} callback
   */
  async renounceLockManager(
    params: {
      lockAddress: string
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.renounceLockManager) {
      throw new Error('Lock version not supported')
    }
    return version.renounceLockManager.bind(this)(
      params,
      transactionOptions,
      callback
    )
  }

  /**
   * Update Refund Penalty: Allow the owner to change the refund penalty.
   * @param {*} params
   * @param {*} callback
   */
  async updateRefundPenalty(
    params: {
      lockAddress: string
      freeTrialLength: number
      refundPenaltyBasisPoints: number
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.updateRefundPenalty) {
      throw new Error('Lock version not supported')
    }
    return version.updateRefundPenalty.bind(this)(
      params,
      transactionOptions,
      callback
    )
  }

  /**
   * Allows a Lock manager to update or remove an event hook
   * @param {*} params
   * @param {*} callback
   */
  async setEventHooks(
    params: {
      lockAddress: string
      keyPurchase?: string
      keyCancel?: string
      validKey?: string
      tokenURI?: string
      keyTransfer?: string
      keyExtend?: string
      keyGrant?: string
      roleHook?: string
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.setEventHooks) {
      throw new Error('Lock version not supported')
    }
    return version.setEventHooks.bind(this)(
      params,
      transactionOptions,
      callback
    )
  }

  /**
   * Allow a Lock manager to change the transfer fee.
   * @param {*} params
   * @param {*} callback
   */
  async updateTransferFee(
    params: {
      lockAddress: string
      transferFeeBasisPoints: number
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.updateTransferFee) {
      throw new Error('Lock version not supported')
    }
    return version.updateTransferFee.bind(this)(
      params,
      transactionOptions,
      callback
    )
  }

  /* Upgrade a lock to a specific version
   * @param {*} params
   * @param {*} callback
   */
  async upgradeLock(
    params: {
      lockAddress: string
      lockVersion: bigint
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ): Promise<string> {
    const version = await this.unlockContractAbiVersion()
    if (version <= 10) {
      throw new Error('Upgrade lock only available for lock v10+')
    }
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    return version.upgradeLock.bind(this)(
      params.lockAddress,
      params.lockVersion,
      callback
    )
  }

  /**
   * Update referrer fee
   * @param {*} params
   * @param {*} callback
   */
  async setReferrerFee(
    params: {
      lockAddress: string
      address: string
      feeBasisPoint: number
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.setReferrerFee) {
      throw new Error('Lock version not supported')
    }
    return version.setReferrerFee.bind(this)(
      params,
      transactionOptions,
      callback
    )
  }

  /**
   * Set signer for `Password hook contract`
   */
  async setPasswordHookSigner(
    params: {
      lockAddress: string
      signerAddress: string
      contractAddress: string
      network: number
    },
    signer: ethers.Wallet | ethers.JsonRpcSigner
  ) {
    const { lockAddress, signerAddress, contractAddress, network } =
      params ?? {}
    const contract = await this.getHookContract({
      network,
      address: contractAddress,
      abi: new ethers.Interface(passwordHookAbi),
    })
    const tx = await contract.connect(this.signer).getFunction('setSigner')(
      lockAddress,
      signerAddress
    )
    return tx
  }

  /**
   * Set signer for `Password with cap hook contract`
   */
  async setPasswordWithCapHookSigner(params: {
    lockAddress: string
    signerAddress: string
    contractAddress: string
    cap: number
    network: number
  }) {
    const { lockAddress, signerAddress, contractAddress, network, cap } =
      params ?? {}
    const contract = await this.getHookContract({
      network,
      address: contractAddress,
      abi: new ethers.Interface(passwordCapHookAbi),
    })
    const tx = await contract.connect(this.signer).getFunction('setSigner')(
      lockAddress,
      signerAddress,
      cap
    )
    return tx.wait()
  }

  /**
   * Change lock manager for a specific key
   * @param {*} params
   * @param {*} callback
   */
  async setKeyManagerOf(
    params: {
      lockAddress: string
      managerAddress: string
      tokenId: string
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    if (!params.managerAddress) throw new Error('Missing managerAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.setKeyManagerOf) {
      throw new Error('Lock version not supported')
    }
    return version.setKeyManagerOf.bind(this)(
      params,
      transactionOptions,
      callback
    )
  }

  /**
   * This yields the authorizations required to spend USDC on behalf of the user
   * to buy a key from a specific lock. This is mostly used for the universal
   * card support!
   * @param param0
   * @returns
   */
  async getAndSignAuthorizationsForTransferAndPurchase({
    amount,
    lockAddress,
    network,
  }: GetAndSignAuthorizationsForTransferAndPurchaseParams) {
    const networkConfig = this.networks[this.networkId]
    const cardPurchaserAddress =
      networkConfig?.universalCard?.cardPurchaserAddress

    if (!cardPurchaserAddress) {
      throw new Error('CardPurchaser not available for this network')
    }

    let usdcContractAddress
    if (networkConfig?.tokens) {
      usdcContractAddress = networkConfig.tokens.find(
        (token: any) => token.symbol === 'USDC'
      )?.address
    }

    if (!usdcContractAddress) {
      throw new Error('USDC not available for this network')
    }

    // first, get the authorization to spend USDC
    // 6 decimals for USDC - 2 as amount is in cents
    const value = `0x${ethers.parseUnits(amount, 4).toString(16)}`
    const now = Math.floor(new Date().getTime() / 1000)
    const transferMessage = {
      from: await this.signer.getAddress(),
      to: ethers.getAddress(cardPurchaserAddress),
      value,
      validAfter: 0,
      validBefore: now + 60 * 60 * 24, // Valid for 1 day (TODO: how do we handle funds when they are stuck?)
      nonce: ethers.hexlify(ethers.randomBytes(32)), // 32 byte hex string
    }

    const transferSignature = await signTransferAuthorization(
      usdcContractAddress,
      transferMessage,
      this.provider,
      this.signer
    )

    // then, get the authorization to buy a key
    const cardPurchaser = new CardPurchaser()
    const { signature: purchaseSignature, message: purchaseMessage } =
      await cardPurchaser.getPurchaseAuthorizationSignature(
        network,
        lockAddress,
        this.signer
      )

    return {
      transferSignature,
      transferMessage,
      purchaseSignature,
      purchaseMessage,
    }
  }

  /**
   * Performs a purchase using the CardPurchaser contract
   * @param param0
   * @returns
   */
  async purchaseWithCardPurchaser({
    transfer,
    purchase,
    callData,
  }: PurchaseWithCardPurchaserParams) {
    const networkConfig = this.networks[this.networkId]
    const cardPurchaserAddress =
      networkConfig?.universalCard?.cardPurchaserAddress

    if (!cardPurchaserAddress) {
      throw new Error('CardPurchaser not available for this network')
    }

    const cardPurchaser = new CardPurchaser()
    return cardPurchaser.purchase(
      this.networkId,
      transfer,
      purchase,
      callData,
      this.signer
    )
  }

  /**
   * Transfers a specific NFT  from one account to another
   * @returns
   */
  async transferFrom(
    params: {
      keyOwner: string
      to: string
      tokenId: string
      lockAddress: string
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    if (!params.keyOwner) throw new Error('Missing keyOwner')
    if (!params.to) throw new Error('Missing to')
    if (!params.tokenId) throw new Error('Missing tokenId')

    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.transferFrom) {
      throw new Error('Lock version not supported')
    }
    return version.transferFrom.bind(this)(params, transactionOptions, callback)
  }

  async setGasRefund(
    params: {
      lockAddress: string
      gasRefundValue: string
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    const version = await this.lockContractAbiVersion(params.lockAddress)
    if (!version.setGasRefundValue) {
      throw new Error('Lock version not supported')
    }
    return version.setGasRefundValue.bind(this)(
      params,
      transactionOptions,
      callback
    )
  }

  /**
   * Set signer for `Discount code` hook contract
   */
  async setDiscountCodeHookSigner(params: {
    lockAddress: string
    signerAddress: string
    contractAddress: string
    network: number
    discountPercentage: number
  }) {
    const {
      lockAddress,
      signerAddress,
      contractAddress,
      network,
      discountPercentage = 0,
    } = params ?? {}
    const contract = await this.getHookContract({
      network,
      address: contractAddress,
      abi: new ethers.Interface(discountCodeHookAbi),
    })

    const discountBasisPoints = discountPercentage * 100
    return contract.connect(this.signer).getFunction('setDiscountForLock')(
      lockAddress,
      signerAddress,
      discountBasisPoints
    )
  }

  /**
   * Set signer for `Discount code` hook contract with cap
   */
  async setDiscountCodeWithCapHookSigner(params: {
    lockAddress: string
    signerAddress: string
    contractAddress: string
    network: number
    discountPercentage: number
    cap: number
  }) {
    const {
      lockAddress,
      signerAddress,
      contractAddress,
      network,
      discountPercentage = 0,
      cap = ethers.MaxUint256,
    } = params ?? {}
    const contract = await this.getHookContract({
      network,
      address: contractAddress,
      abi: new ethers.Interface(discountCodeWithCapHookAbi),
    })

    const discountBasisPoints = discountPercentage * 100
    const transaction = await contract
      .connect(this.signer)
      .getFunction('setSigner')(
      lockAddress,
      signerAddress,
      discountBasisPoints,
      cap
    )
    return transaction.wait()
  }

  async setMerkleRoot({
    network,
    lockAddress,
    hookAddress,
    root,
  }: {
    network: number
    lockAddress: string
    hookAddress: string
    root: string
  }) {
    const contract = await this.getHookContract({
      network,
      address: hookAddress,
      abi: new ethers.Interface(allowListHookAbi),
    })

    const transaction = await contract
      .connect(this.signer)
      .getFunction('setMerkleRootForLock')(lockAddress, root)
    return transaction.wait()
  }
}
