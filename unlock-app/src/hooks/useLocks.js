import { useState, useEffect, useContext, useReducer } from 'react'
import { TransactionType, TransactionStatus } from '../unlockTypes'
import { UNLIMITED_KEYS_COUNT } from '../constants'
import { StorageServiceContext } from '../utils/withStorageService'
import { Web3ServiceContext } from '../utils/withWeb3Service'
import { WalletServiceContext } from '../utils/withWalletService'
import { GraphServiceContext } from '../utils/withGraphService'
import { transactionTypeMapping } from '../utils/types'
import { ConfigContext } from '../utils/withConfig'
import { AuthenticationContext } from '../contexts/AuthenticationContext'
import { processTransaction } from './useLock'

/**
 * Retrieves a lock object at the address
 */
export const getLockAtAddress = async (web3Service, address, network) => {
  let lock
  try {
    lock = await web3Service.getLock(address, network)
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
  setLoading,
  network
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
    const lockFromChain = await getLockAtAddress(
      web3Service,
      lock.address,
      network
    )
    if (lockFromChain) {
      // Merge the data from subgraph and data from chain to have the most complete object
      addToLocks({
        ...lock,
        ...lockFromChain,
        network,
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
  const address = await web3Service.generateLockAddress(owner, lock, network)
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
        processTransaction(
          'createLock',
          web3Service,
          config,
          lock,
          addToLocks,
          transactionHash,
          walletService.networkId
        )

        lock.creationBlock = Number.MAX_SAFE_INTEGER.toString()
        lock.network = network

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
  const { network } = useContext(AuthenticationContext)
  const web3Service = useContext(Web3ServiceContext)
  const walletService = useContext(WalletServiceContext)
  const storageService = useContext(StorageServiceContext)
  const graphService = useContext(GraphServiceContext)
  const config = useContext(ConfigContext)
  const [error, setError] = useState(undefined)
  const [loading, setLoading] = useState(true)

  graphService.connect(config.networks[network].subgraphURI)

  // We use a reducer so we can easily add locks as they are retrieved
  const [locks, addToLocks] = useReducer((locks, lock) => {
    if (lock === -1) {
      // Reset!
      return []
    }
    if (lock.network !== network) {
      // Wrong network
      return locks
    }

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
    addToLocks(-1) // reset all locks!
    retrieveLocks(
      web3Service,
      graphService,
      owner,
      addToLocks,
      setLoading,
      network
    )
  }, [owner, network])

  return { error, loading, locks, addLock }
}

export default useLocks
