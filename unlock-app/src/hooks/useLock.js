import { useState, useContext, useEffect } from 'react'
import { Web3ServiceContext } from '../utils/withWeb3Service'
import { WalletServiceContext } from '../utils/withWalletService'
import { ConfigContext } from '../utils/withConfig'
import { TransactionType } from '../unlockTypes'
import { transactionTypeMapping } from '../utils/types'
import { AuthenticationContext } from '../components/interface/Authenticate'
import { FATAL_WRONG_NETWORK } from '../errors'

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
    }, config.blockTime / 2)

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
export const purchaseKeyFromLock = (
  web3Service,
  walletService,
  config,
  lock,
  recipient,
  referrer,
  setLock,
  network,
  callback
) => {
  walletService.purchaseKey(
    {
      lockAddress: lock.address,
      owner: recipient,
      referrer,
      keyPrice: lock.keyPrice,
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
/**
 * A hook which yield a lock, tracks its state changes, and (TODO) provides methods to update it
 * @param {*} lock
 * @param {*} network // network on which the lock is
 */
export const useLock = (lockFromProps, network) => {
  const [lock, setLock] = useState(lockFromProps)
  const { network: walletNetwork } = useContext(AuthenticationContext)
  const web3Service = useContext(Web3ServiceContext)
  const walletService = useContext(WalletServiceContext)
  const config = useContext(ConfigContext)
  const [error, setError] = useState(null)

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

  const purchaseKey = (recipient, referrer, callback) => {
    if (walletNetwork !== network) {
      setError(FATAL_WRONG_NETWORK)
    } else {
      purchaseKeyFromLock(
        web3Service,
        walletService,
        config,
        lock,
        recipient,
        referrer,
        setLock,
        network,
        callback
      )
    }
  }

  const getKeyForAccount = (owner) => {
    return web3Service.getKeyByLockForOwner(lock.address, owner, network)
  }

  return {
    lock: {
      ...lockFromProps, // merge lock
      ...lock,
    },
    updateKeyPrice,
    withdraw,
    purchaseKey,
    getKeyForAccount,
    error,
  }
}

export default useLock
