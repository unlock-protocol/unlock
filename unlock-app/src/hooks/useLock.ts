import { Web3Service } from '@unlock-protocol/unlock-js'
import * as ethers from 'ethers'
import { useContext, useReducer, useState } from 'react'
import { UNLIMITED_KEYS_COUNT } from '../constants'
import { AuthenticationContext } from '../contexts/AuthenticationContext'
import LocksContext from '../contexts/LocksContext'
import { FATAL_WRONG_NETWORK } from '../errors'
import { Lock } from '../unlockTypes'
import { ConfigContext } from '../utils/withConfig'
import { WalletServiceContext } from '../utils/withWalletService'
import { Web3ServiceContext } from '../utils/withWeb3Service'
import { getCardConnected, getFiatPricing } from './useCards'
/**
 * Event handler
 * @param {*} hash
 * @param {*} update
 */
export const processTransaction = async (
  type: string,
  web3Service: Web3Service,
  config: any,
  lock: any,
  setLock: (...args: any) => void,
  hash: string,
  network: number
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
}: {
  web3Service: any
  walletService: any
  config: any
  lock: Lock
  maxNumberOfKeys: number
  setLock: (...args: any) => void
  callback: any
}) {
  walletService.setMaxNumberOfKeys(
    {
      lockAddress: lock.address,
      maxNumberOfKeys,
    },
    async (error: any, tHash: string) => {
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
 * Function called to update the price of a lock
 */
export const updateKeyPriceOnLock = (
  web3Service: any,
  walletService: any,
  config: any,
  lock: Lock,
  newKeyPrice: string,
  setLock: (...args: any) => void,
  callback: (...args: any) => void
) => {
  walletService.updateKeyPrice(
    {
      lockAddress: lock.address,
      keyPrice: newKeyPrice,
    },
    async (error: any, transactionHash: string) => {
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
 * Function called to the lock ERC20 allowance
 * (address a v10 bug)
 */
export const updateSelfAllowanceOnLock = (
  web3Service: any,
  walletService: any,
  config: any,
  lock: Lock,
  allowanceAmount: string,
  setLock: (...args: any) => void,
  callback: (...args: any) => void
) => {
  walletService.approveBeneficiary(
    {
      lockAddress: lock.address,
      spender: lock.address,
      amount: allowanceAmount,
      erc20Address: lock.currencyContractAddress,
    },
    async (error: any, transactionHash: string) => {
      if (error) {
        throw error
      }
      lock.selfAllowance = allowanceAmount
      processTransaction(
        'approveBeneficiary',
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
 * Function called to withdraw from a lock
 */
export const withdrawFromLock = (
  web3Service: any,
  walletService: any,
  config: any,
  lock: Lock,
  setLock: (...args: any) => void,
  callback: (...args: any) => void
) => {
  walletService.withdrawFromLock(
    {
      lockAddress: lock.address,
    },
    async (error: any, transactionHash: string) => {
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
 * Function called to purchase a key
 */
export const purchaseKeyFromLock = async (
  web3Service: any,
  walletService: any,
  config: any,
  lock: Lock,
  recipient: string,
  referrer: string,
  setLock: (...args: any) => void,
  data: string,
  recurringPayments: number | undefined,
  callback: (...args: any) => void
) => {
  // In order to not modify the behavior for v10, by default if the user owns a key on
  // a non expiring lock, we extend it.
  // TODO: allow for purchase of explicit new keys!
  const tokenId = await web3Service.getTokenIdForOwner(
    lock.address,
    recipient,
    walletService.networkId
  )

  if (
    tokenId &&
    lock.expirationDuration !== -1 &&
    (lock.publicLockVersion || 0) >= 10
  ) {
    // We assume this is a renewal to remain consistent with old versions of the checkout
    return walletService.extendKey({
      lockAddress: lock.address,
      tokenId,
      referrer,
      keyPrice: lock.keyPrice,
      data,
    })
  }

  return walletService.purchaseKey(
    {
      lockAddress: lock.address,
      owner: recipient,
      referrer,
      recurringPayments,
      keyPrice: lock.keyPrice,
      data,
    },
    async (error: any, transactionHash: string) => {
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

export const purchaseMultipleKeysFromLock = async (
  web3Service: any,
  walletService: any,
  config: any,
  lock: Lock,
  setLock: (...args: any) => void,
  lockAddress: string,
  keyPrices: string[],
  owners: string[],
  data: string[],
  recurringPayments: number[] | undefined,
  callback: (...args: any) => void
) => {
  return walletService.purchaseKeys(
    {
      lockAddress,
      owners,
      keyPrices,
      recurringPayments,
      data,
    },
    async (error: any, transactionHash: string) => {
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
/**
 * A hook which yield a lock, tracks its state changes, and (TODO) provides methods to update it
 * @param {*} lock
 * @param {*} network // network on which the lock is
 */
export const useLock = (lockFromProps: Partial<Lock>, network: number) => {
  const { locks, addLock } = useContext(LocksContext)

  const [lock, setLock] = useReducer(
    (oldLock: any, newLock: any) => {
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
  const [error, setError] = useState<string | null>(null)

  const getLock = async (opts: any = {}) => {
    let lockDetails

    if (locks && locks[lock.address]) {
      lockDetails = locks[lock.address]
    } else {
      lockDetails = await web3Service.getLock(lock.address, network)
      if (opts?.pricing) {
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

  const updateKeyPrice = (
    newKeyPrice: string,
    callback: (...args: any) => void
  ) => {
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

  const withdraw = (callback: (...args: any) => void) => {
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

  const purchaseKey = async (
    recipient: string,
    referrer: string,
    data: string,
    recurringPayments: number | undefined,
    callback: (...args: any) => void
  ) => {
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
        data,
        recurringPayments,
        callback
      )
    }
  }

  const purchaseMultipleKeys = async (
    lockAddress: string,
    keyPrices: string[],
    owners: string[],
    data: string[],
    recurringPayments: number[] | undefined,
    callback: (...args: any) => void
  ) => {
    if (walletNetwork !== network) {
      setError(FATAL_WRONG_NETWORK)
    } else {
      await purchaseMultipleKeysFromLock(
        web3Service,
        walletService,
        config,
        lock,
        setLock,
        lockAddress,
        keyPrices,
        owners,
        data,
        recurringPayments,
        callback
      )
    }
  }

  const getKeyForAccount = async (owner: string) => {
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
    } catch (error: any) {
      console.error(
        `Could not get card pricing for ${lock.address}: ${error?.message}`
      )
    }
  }

  // Returns 1 if connected
  // -1 if no stripe account exsist
  // 0 if a stripe account exists but is not ready
  const isStripeConnected = async () => {
    if (!lockFromProps.address) return
    try {
      const response = await getCardConnected(
        config,
        lockFromProps.address,
        network
      )

      return response.connected
    } catch (error: any) {
      console.error(
        `Could not get Stripe status for ${lockFromProps.address}: ${error?.message}`
      )
      return -1
    }
  }

  // Checks if the address is a manager
  const isLockManager = async (lockManager: string) => {
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

  function updateMaxNumberOfKeys(
    maxNumberOfKeys: number,
    callback: (...args: any) => void
  ) {
    if (walletNetwork !== network) {
      setError(FATAL_WRONG_NETWORK)
    } else {
      setMaxNumberOfKeysOnLock({
        web3Service,
        walletService,
        config,
        lock,
        // @ts-ignore
        maxNumberOfKeys:
          maxNumberOfKeys === UNLIMITED_KEYS_COUNT
            ? ethers.constants.MaxUint256
            : maxNumberOfKeys,
        setLock,
        callback,
      })
    }
  }

  function updateSelfAllowance(
    allowanceAmount: string,
    callback: (...args: any) => void
  ) {
    if (walletNetwork !== network) {
      setError(FATAL_WRONG_NETWORK)
    } else {
      updateSelfAllowanceOnLock(
        web3Service,
        walletService,
        config,
        lock,
        allowanceAmount,
        setLock,
        callback
      )
    }
  }

  const getTokenIdFromOwner = async ({
    lockAddress,
    owner,
    network,
  }: {
    lockAddress: string
    owner: string
    network: number
  }) => {
    const tokenId = await web3Service.getTokenIdForOwner(
      lockAddress,
      owner,
      network
    )
    return tokenId
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
    updateMaxNumberOfKeys,
    purchaseMultipleKeys,
    updateSelfAllowance,
    getTokenIdFromOwner,
  }
}

export default useLock
