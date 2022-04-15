import { useState, useContext, useEffect, useReducer } from 'react'
import * as ethers from 'ethers'
import { Web3ServiceContext } from '../utils/withWeb3Service'
import { WalletServiceContext } from '../utils/withWalletService'
import { ConfigContext } from '../utils/withConfig'
import { TransactionType } from '../unlockTypes'
import { transactionTypeMapping } from '../utils/types'
import { AuthenticationContext } from '../contexts/AuthenticationContext'
import { FATAL_WRONG_NETWORK } from '../errors'
import { getFiatPricing, getCardConnected } from './useCards'
import { generateKeyMetadataPayload } from '../structured_data/keyMetadata'
import { StorageService } from '../services/storageService'
import LocksContext from '../contexts/LocksContext'
import { MAX_UINT, UNLIMITED_KEYS_COUNT } from '../constants'
/**
 * Event handler
 * @param {*} hash
 * @param {*} update
 */
export const processTransaction = async (
  type,
  web3Service,
  config,
  lock,
  setLock,
  hash,
  network
) => {
  const transaction = await web3Service.getTransaction(hash, network)
  const blockTime = config.networks[network].blockTime
  if (
    !transaction ||
    transaction.confirmations <= config.requiredConfirmations
  ) {
    // Polling if the transaction is not confirmed
    setTimeout(async () => {
      processTransaction(
        type,
        web3Service,
        config,
        lock,
        setLock,
        hash,
        network
      )
    }, blockTime / 2)

    setLock({
      ...lock,
      transactions: {
        ...lock.transactions,
        [hash]: {
          type,
          confirmations: transaction?.confirmations || 0,
        },
      },
    })
  } else {
    // discarding the transaction once it's confirmed
    const remainingTransactions = lock.transactions || {}
    if (remainingTransactions[hash]) {
      delete remainingTransactions[hash]
    }
    setLock({
      ...lock,
      transactions: remainingTransactions,
    })
  }
}

/**
 * Function called to set the maxNumberOfKeys of a lock
 */

export function setMaxNumberOfKeysOnLock({
  web3Service,
  walletService,
  config,
  lock,
  maxNumberOfKeys,
  setLock,
  callback,
}) {
  walletService.setMaxNumberOfKeys(
    {
      lockAddress: lock.address,
      maxNumberOfKeys,
    },
    async (error, tHash) => {
      if (error) {
        throw error
      }
      lock.maxNumberOfKeys = maxNumberOfKeys

      processTransaction(
        'setMaxNumberOfKeys',
        web3Service,
        config,
        lock,
        setLock,
        tHash,
        walletService.networkId
      )
      return callback(tHash)
    }
  )
}

/**
 * Function called to updated the price of a lock
 */
export const updateKeyPriceOnLock = (
  web3Service,
  walletService,
  config,
  lock,
  newKeyPrice,
  setLock,
  callback
) => {
  walletService.updateKeyPrice(
    {
      lockAddress: lock.address,
      keyPrice: newKeyPrice,
    },
    async (error, transactionHash) => {
      if (error) {
        throw error
      }
      lock.keyPrice = newKeyPrice
      processTransaction(
        'updateKeyPrice',
        web3Service,
        config,
        lock,
        setLock,
        transactionHash,
        walletService.networkId
      )
      return callback(transactionHash)
    }
  )
}

/**
 * Function called to updated the price of a lock
 */
export const withdrawFromLock = (
  web3Service,
  walletService,
  config,
  lock,
  setLock,
  callback
) => {
  walletService.withdrawFromLock(
    {
      lockAddress: lock.address,
    },
    async (error, transactionHash) => {
      if (error) {
        throw error
      }
      lock.balance = '0'
      processTransaction(
        'withdraw',
        web3Service,
        config,
        lock,
        setLock,
        transactionHash,
        walletService.networkId
      )
      if (callback) {
        return callback(transactionHash)
      }
    }
  )
}
/**
 * Function called to updated the price of a lock
 */
export const purchaseKeyFromLock = async (
  web3Service,
  walletService,
  config,
  lock,
  recipient,
  referrer,
  setLock,
  network,
  data,
  callback
) => {
  return walletService.purchaseKey(
    {
      lockAddress: lock.address,
      owner: recipient,
      referrer,
      keyPrice: lock.keyPrice,
      data,
    },
    async (error, transactionHash) => {
      if (error) {
        throw error
      }
      processTransaction(
        'keyPurchase',
        web3Service,
        config,
        lock,
        setLock,
        transactionHash,
        walletService.networkId
      )
      if (callback) {
        return callback(transactionHash)
      }
    }
  )
}

export const purchaseMultipleKeys = async ({
  walletService,
  lockAddress,
  owners = [],
}) => {
  return walletService.purchaseKeys({
    lockAddress,
    owners,
  })
}
/**
 * A hook which yield a lock, tracks its state changes, and (TODO) provides methods to update it
 * @param {*} lock
 * @param {*} network // network on which the lock is
 */
export const useLock = (lockFromProps, network) => {
  const { locks, addLock } = useContext(LocksContext)

  const [lock, setLock] = useReducer(
    (oldLock, newLock) => {
      return { ...oldLock, ...newLock }
    },
    {
      ...lockFromProps,
      network,
    }
  )
  const { network: walletNetwork } = useContext(AuthenticationContext)
  const web3Service = useContext(Web3ServiceContext)
  const walletService = useContext(WalletServiceContext)
  const config = useContext(ConfigContext)
  const [error, setError] = useState(null)

  const getLock = async (opts = {}) => {
    let lockDetails

    if (locks && locks[lock.address]) {
      lockDetails = locks[lock.address]
    } else {
      lockDetails = await web3Service.getLock(lock.address, network)
      if (opts.pricing) {
        try {
          const fiatPricing = await getFiatPricing(
            config,
            lock.address,
            network
          )
          lockDetails = {
            ...lockDetails,
            fiatPricing,
          }
        } catch (error) {
          console.error('Could not retrieve fiat pricing', error)
        }
      }
      if (addLock) {
        addLock({
          ...lockDetails,
          address: lock.address,
        })
      }
    }
    const mergedLock = {
      ...lock,
      ...lockDetails,
    }
    setLock(mergedLock)
    return mergedLock
  }

  const updateKeyPrice = (newKeyPrice, callback) => {
    if (walletNetwork !== network) {
      setError(FATAL_WRONG_NETWORK)
    } else {
      updateKeyPriceOnLock(
        web3Service,
        walletService,
        config,
        lock,
        newKeyPrice,
        setLock,
        callback
      )
    }
  }

  const withdraw = (callback) => {
    if (walletNetwork !== network) {
      setError(FATAL_WRONG_NETWORK)
    } else {
      withdrawFromLock(
        web3Service,
        walletService,
        config,
        lock,
        setLock,
        callback
      )
    }
  }

  const purchaseKey = async (recipient, referrer, data, callback) => {
    if (walletNetwork !== network) {
      setError(FATAL_WRONG_NETWORK)
    } else {
      await purchaseKeyFromLock(
        web3Service,
        walletService,
        config,
        lock,
        recipient,
        referrer,
        setLock,
        network,
        data,
        callback
      )
    }
  }

  const getKeyForAccount = async (owner) => {
    return web3Service.getKeyByLockForOwner(lock.address, owner, network)
  }

  const getCreditCardPricing = async () => {
    try {
      const fiatPricing = await getFiatPricing(config, lock.address, network)
      const mergedLock = {
        ...lock,
        fiatPricing,
      }
      setLock(mergedLock)

      return fiatPricing
    } catch (error) {
      console.error(
        `Could not get card pricing for ${lock.address}: ${error.message}`
      )
    }
  }

  // Returns 1 if connected
  // -1 if no stripe account exsist
  // 0 if a stripe account exists but is not ready
  const isStripeConnected = async () => {
    try {
      const response = await getCardConnected(
        config,
        lockFromProps.address,
        network
      )

      return response.connected
    } catch (error) {
      console.error(
        `Could not get Stripe status for ${lockFromProps.address}: ${error.message}`
      )
      return -1
    }
  }

  // Checks if the address is a manager
  const isLockManager = async (lockManager) => {
    if (!lockManager) {
      return false
    }
    const isLockManager = await web3Service.isLockManager(
      lockFromProps.address,
      lockManager,
      network
    )
    return isLockManager
  }

  const getKeyData = async (keyId, signer) => {
    let payload = {}
    let signature

    // If we have a signer, try to get the protected data!
    if (signer) {
      payload = generateKeyMetadataPayload(signer, {})
      signature = await walletService.unformattedSignTypedData(signer, payload)
    }

    const storageService = new StorageService(config.services.storage.host)
    const data = await storageService.getKeyMetadata(
      lockFromProps.address,
      keyId,
      payload,
      signature,
      network
    )
    return data
  }

  const markAsCheckedIn = async (signer, keyId) => {
    const payload = generateKeyMetadataPayload(signer, {
      lockAddress: lockFromProps.address,
      keyId,
      metadata: {
        checkedInAt: new Date().getTime(),
      },
    })
    const signature = await walletService.unformattedSignTypedData(
      signer,
      payload
    )
    const storageService = new StorageService(config.services.storage.host)
    const response = await storageService.setKeyMetadata(
      lockFromProps.address,
      keyId,
      payload,
      signature,
      network
    )
    return response.status === 202
  }

  function updateMaxNumberOfKeys(maxNumberOfKeys, callback) {
    if (walletNetwork !== network) {
      setError(FATAL_WRONG_NETWORK)
    } else {
      setMaxNumberOfKeysOnLock({
        web3Service,
        walletService,
        config,
        lock,
        maxNumberOfKeys:
          maxNumberOfKeys === UNLIMITED_KEYS_COUNT
            ? ethers.constants.MaxUint256
            : maxNumberOfKeys,
        setLock,
        callback,
      })
    }
  }
  return {
    getLock,
    lock,
    updateKeyPrice,
    withdraw,
    purchaseKey,
    getKeyForAccount,
    error,
    getCreditCardPricing,
    isStripeConnected,
    isLockManager,
    getKeyData,
    markAsCheckedIn,
    updateMaxNumberOfKeys,
  }
}

export default useLock
