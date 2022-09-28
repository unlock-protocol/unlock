import { useState, useEffect, useContext, useReducer } from 'react'
import { UNLIMITED_KEYS_COUNT } from '../constants'
import {
  StorageServiceContext,
  useStorageService,
} from '../utils/withStorageService'
import { useWeb3Service, Web3ServiceContext } from '../utils/withWeb3Service'
import {
  useWalletService,
  WalletServiceContext,
} from '../utils/withWalletService'
import { GraphServiceContext } from '../utils/withGraphService'
import { ConfigContext } from '../utils/withConfig'
import {
  AuthenticationContext,
  useAuth,
} from '../contexts/AuthenticationContext'
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
    lock.network = network
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
  const locks = await graphService.locksByManager(owner, network)

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
  const {
    name,
    expirationDuration,
    maxNumberOfKeys,
    currencyContractAddress,
    keyPrice,
  } = lock

  const lockAddress = await walletService.createLock(
    {
      expirationDuration,
      keyPrice,
      maxNumberOfKeys,
      owner,
      name,
      currencyContractAddress,
      publicLockVersion: 11, // Current version that we deploy!
    },
    {} /** transactionParams */,
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

        lock.address = '0x' // Address is not known
        lock.pending = true
        lock.creationBlock = Number.MAX_SAFE_INTEGER.toString()
        lock.network = network
        lock.transactions = {
          [transactionHash]: {
            confirmations: 0,
          },
        }
        addToLocks(lock)
        callback(null, lock)
      }
    }
  )

  setTimeout(async () => {
    // Adding a 1 sec delay just to make sure data is available!
    const newLock = await getLockAtAddress(web3Service, lockAddress, network)
    newLock.creationBlock = newLock.asOf // Assume the lock was just created!
    // remove the pending lock
    lock.delete = true
    addToLocks(lock)
    addToLocks(newLock)
  }, 1000)

  return 'lockAddress'
}

/**
 * A hook which yields locks
 * This hook yields the list of locks for the owner based on data from the graph and the chain
 * @param {*} address
 */
export const useLocks = (owner) => {
  const { network } = useAuth()
  const web3Service = useWeb3Service()
  const walletService = useWalletService()
  const storageService = useStorageService()
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
    if (lock?.network !== network) {
      // Wrong network
      return locks
    }

    const index = locks.findIndex(
      (element) =>
        element?.address?.toLowerCase() === lock.address?.toLowerCase()
    )

    if (index === -1) {
      locks.push(lock) // not previously seen lock
    } else if (lock.delete) {
      locks[index] = null // we delete!
    } else {
      // merging existing lock
      locks[index] = {
        ...locks[index],
        ...lock,
      }
    }

    const filteredAndSorted = [...locks]
      .filter((lock) => !!lock)
      .sort((x, y) => {
        return parseInt(y.creationBlock) - parseInt(x.creationBlock)
      })

    // filter and sort!
    return filteredAndSorted
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
