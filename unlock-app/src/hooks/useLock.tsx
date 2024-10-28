import { Web3Service } from '@unlock-protocol/unlock-js'
import { useReducer, useState } from 'react'
import { useConfig } from '~/utils/withConfig'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { Lock } from '../unlockTypes'
import { getCardConnected } from './useCards'
import { useProvider } from './useProvider'

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
  const confirmations = transaction ? await transaction.confirmations() : 0
  if (!transaction || confirmations <= 12) {
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
    }, 1000) // every second

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
    {} /** transactionParams */,
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
    {} /** transactionParams */,
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
    {} /** transactionParams */,
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
  recurringPayments: number | undefined | string,
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
    {} /** transactionParams */,
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
  const [lock, setLock] = useReducer(
    (oldLock: any, newLock: any) => {
      return { ...oldLock, ...newLock }
    },
    {
      ...lockFromProps,
      network,
    }
  )
  const web3Service = useWeb3Service()
  const { getWalletService } = useProvider()
  const config = useConfig()
  const [error] = useState<string | null>(null)

  const updateKeyPrice = async (
    newKeyPrice: string,
    callback: (...args: any) => void
  ) => {
    const walletService = await getWalletService(network)
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

  const withdraw = async (callback: (...args: any) => void) => {
    const walletService = await getWalletService(network)
    withdrawFromLock(
      web3Service,
      walletService,
      config,
      lock,
      setLock,
      callback
    )
  }

  const purchaseKey = async (
    recipient: string,
    referrer: string,
    data: string,
    recurringPayments: number | undefined | string,
    callback: (...args: any) => void
  ) => {
    const walletService = await getWalletService(network)
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
      lockFromProps.address!,
      lockManager,
      network
    )
    return isLockManager
  }

  async function updateSelfAllowance(
    allowanceAmount: string,
    callback: (...args: any) => void
  ) {
    const walletService = await getWalletService(network)
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

  return {
    lock,
    updateKeyPrice,
    withdraw,
    purchaseKey,
    error,
    isStripeConnected,
    isLockManager,
    updateSelfAllowance,
  }
}

export default useLock
