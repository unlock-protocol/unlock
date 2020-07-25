import { useState, useEffect, useContext, useReducer } from 'react'
import { useSelector } from 'react-redux'
import { TransactionType, TransactionStatus } from '../unlockTypes'
import { UNLIMITED_KEYS_COUNT } from '../constants'
import { StorageServiceContext } from '../utils/withStorageService'
import { Web3ServiceContext } from '../utils/withWeb3Service'
import { WalletServiceContext } from '../utils/withWalletService'
import { GraphServiceContext } from '../utils/withGraphService'
import { transactionTypeMapping } from '../utils/types'
import { ConfigContext } from '../utils/withConfig'

/**
 * Retrieves a lock object at the address
 */
export const getLockAtAddress = async (web3Service, address) => {
  let lock
  try {
    lock = await web3Service.getLock(address)
    lock.unlimitedKeys = lock.maxNumberOfKeys === UNLIMITED_KEYS_COUNT
    lock.address = address
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Could not get lock at ${address}: ${error.message}`)
  }
  return lock
}

/**
 * Retrieves the locks for a user
 */
export const retrieveLocks = async (
  web3Service,
  graphService,
  owner,
  addToLocks,
  setLoading
) => {
  // The locks from the subgraph miss some important things, such as balance,
  // ERC20 info.. etc so we need to retrieve them from unlock-js too.
  // TODO: add these missing fields to the graph!
  const locks = await graphService.locksByManager(owner)

  // Sort locks to show the most recent first
  locks.sort((x, y) => {
    return parseInt(y.creationBlock) - parseInt(x.creationBlock)
  })

  const loadNext = async (locks, done) => {
    const lock = locks.shift()
    if (!lock) {
      return done()
    }
    const lockFromChain = await getLockAtAddress(web3Service, lock.address)
    if (lockFromChain) {
      // Merge the data from subgraph and data from chain to have the most complete object
      addToLocks({
        ...lock,
        ...lockFromChain,
      })
    }
    // HACK: We delay each lock retrieval by 300ms to avoid rate limits...
    setTimeout(() => {
      loadNext(locks, done)
    }, 300)
  }

  return new Promise((resolve) => {
    loadNext(locks, () => {
      setLoading(false)
      resolve()
    })
  })
}

/**
 * Processes a transaction
 */
export const processLockCreationTransaction = async (
  web3Service,
  config,
  addToLocks,
  transactionHash,
  defaults
) => {
  const transaction = await web3Service.getTransaction(
    transactionHash,
    defaults
  )
  transaction.type = transactionTypeMapping(transaction.type)
  if (transaction.lock && transaction.type === TransactionType.LOCK_CREATION) {
    let lock
    if (transaction.status === TransactionStatus.MINED) {
      lock = await getLockAtAddress(web3Service, transaction.lock)
      if (lock) {
        lock.creationTransaction = transaction
        lock.creationBlock = transaction.blockNumber
      }
    } else {
      // The might not yet been created...we need to show it, but as pending!
      // TODO: show its params if we can get them from the transaction?
      lock = {
        address: transaction.lock,
        creationTransaction: transaction,
        creationBlock: Number.MAX_SAFE_INTEGER.toString(),
      }
    }
    addToLocks(lock)
  }
}

/**
 * Let's also retrieve past transactions for this user which locksmith keeps
 * track of just in case one of them is a lock creation!
 */
export const retrieveLockCreationTransactions = async (
  web3Service,
  storageService,
  config,
  addToLocks,
  owner
) => {
  const {
    hashes: userTransactions,
  } = await storageService.getRecentTransactionsHashesSentBy(owner)

  // For each of the hashes, let's retrieve the transaction
  userTransactions.forEach(async (transaction) => {
    try {
      processLockCreationTransaction(
        web3Service,
        config,
        addToLocks,
        transaction.hash,
        transaction
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        `Could not get transaction at ${transaction.hash}: ${error.message}`
      )
    }
  })
}

/**
 * Function to create a lock to be added to the list of locks
 */
export const createLock = async (
  web3Service,
  walletService,
  storageService,
  owner,
  lock,
  config,
  network,
  addToLocks,
  setError,
  callback
) => {
  // New locks have the following properties
  lock.outstandingKeys = 0
  lock.balance = '0'
  // First get the address
  const address = await web3Service.generateLockAddress(owner, lock)
  lock.address = address
  // Second, create the lock
  return walletService.createLock(
    {
      expirationDuration: lock.expirationDuration,
      keyPrice: lock.keyPrice,
      maxNumberOfKeys: lock.maxNumberOfKeys,
      owner,
      name: lock.name,
      currencyContractAddress: lock.currencyContractAddress,
    },
    async (createLockError, transactionHash) => {
      if (createLockError) {
        setError(createLockError)
        callback(createLockError)
      } else {
        // Third, set it!
        lock.creationTransaction = {
          confirmations: 0,
          createdAt: new Date().getTime(),
          hash: transactionHash,
          lock: lock.address,
          type: TransactionType.LOCK_CREATION,
        }
        lock.creationBlock = Number.MAX_SAFE_INTEGER.toString()

        // Store the hash!
        storageService.storeTransaction(
          transactionHash,
          owner,
          config.unlockAddress,
          network.name
        )

        addToLocks(lock)
        callback(null, lock)
      }
    }
  )
}

/**
 * A hook which yields locks
 * This hook yields the list of locks for the owner based on data from the graph and the chain
 * @param {*} address
 */
export const useLocks = (owner) => {
  const network = useSelector((state) => state.network)
  const web3Service = useContext(Web3ServiceContext)
  const walletService = useContext(WalletServiceContext)
  const storageService = useContext(StorageServiceContext)
  const graphService = useContext(GraphServiceContext)
  const config = useContext(ConfigContext)
  const [error, setError] = useState(undefined)
  const [loading, setLoading] = useState(true)

  // We use a reducer so we can easily add locks as they are retrieved
  const [locks, addToLocks] = useReducer((locks, lock) => {
    const index = locks.findIndex(
      (element) => element.address.toLowerCase() === lock.address.toLowerCase()
    )

    if (index === -1) {
      // New lock, add it
      locks.push(lock)
    } else {
      // The lock already exists. we merge
      locks[index] = {
        ...locks[index],
        ...lock,
      }
    }
    return [...locks].sort((x, y) => {
      return parseInt(y.creationBlock) - parseInt(x.creationBlock)
    })
  }, [])

  /**
   * Function to create a lock to be added to the list of locks
   * @param {*} lock
   */
  const addLock = (lock, callback) => {
    createLock(
      web3Service,
      walletService,
      storageService,
      owner,
      lock,
      config,
      network,
      addToLocks,
      setError,
      callback
    )
  }

  /**
   * Retrieves the locks when initialized both from the graph and from pending transactions
   */
  useEffect(() => {
    retrieveLocks(web3Service, graphService, owner, addToLocks, setLoading)
    retrieveLockCreationTransactions(
      web3Service,
      storageService,
      config,
      addToLocks,
      owner
    )
  }, [owner])

  return { error, loading, locks, addLock }
}

export default useLocks
