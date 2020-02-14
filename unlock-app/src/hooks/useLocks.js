import { useState, useEffect, useContext, useReducer } from 'react'
import { useSelector } from 'react-redux'
import { TransactionType } from '../unlockTypes'
import { UNLIMITED_KEYS_COUNT } from '../constants'
import { StorageServiceContext } from '../utils/withStorageService'
import { Web3ServiceContext } from '../utils/withWeb3Service'
import { WalletServiceContext } from '../utils/withWalletService'

import GraphService from '../services/graphService'
import configure from '../config'

const config = configure()

/**
 * A hook which yields locks
 */
/**
 * This hook yields the list of locks for the owner based on data from the graph and the chain
 * @param {*} address
 */
export const useLocks = owner => {
  // Let's retrieve the locks!
  const network = useSelector(state => state.network)
  const web3Service = useContext(Web3ServiceContext)
  const walletService = useContext(WalletServiceContext)
  const storageService = useContext(StorageServiceContext)
  const [error, setError] = useState(undefined)
  const [loading, setLoading] = useState(true)

  // We use a reducer so we can easily add locks as they are retrieved
  const [locks, addToLocks] = useReducer((locks, lock) => {
    let l = locks.find(element => element.address === lock.address)
    if (!l) {
      // New lock, add it
      return [lock, ...locks]
    }
    // The lock already exists. we merge
    l = {
      ...l,
      ...lock,
    }
    return locks
  }, [])

  // TODO Load thru context
  const { subgraphURI, unlockAddress } = config
  // TODO: move to context
  const graphService = new GraphService(subgraphURI)

  // Connect to the provider.
  // TODO: this should probably be moved upstream
  // It is noop if already called somewhere else
  walletService.connect(config.providers[Object.keys(config.providers)[0]])

  /**
   * Helper function: retrieves a lock object at the address
   */
  const getLockAtAddress = async address => {
    const lock = await web3Service.getLock(address)
    lock.unlimitedKeys = lock.maxNumberOfKeys === UNLIMITED_KEYS_COUNT
    lock.address = address
    return lock
  }

  /**
   * Retrieves the locks for a user
   */
  const retrieveLocks = async () => {
    // The locks from the subgraph miss some important things, such as balance,
    // ERC20 info.. etc so we need to retrieve them from unlock-js too.
    // TODO: add these missing fields to the graph!
    const lockAddresses = (await graphService.locksByOwner(owner)).map(
      lock => lock.address
    )

    const lockPromises = lockAddresses.map(async (address, index) => {
      // HACK: We delay each lock retrieval by 300ms to avoid rate limits...
      await new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 300 * index)
      })
      addToLocks(await getLockAtAddress(address))
    })
    await Promise.all(lockPromises)
    setLoading(false)
  }

  /**
   * Let's also retrieve past transactions for this user which locksmith keeps track of just in case one of them is a lock creation!
   */
  const retrieveLockCreationTransactions = async () => {
    const { hashes } = await storageService.getRecentTransactionsHashesSentBy(
      owner
    )

    // For each transaction, we will get a 'transaction.updated' event
    // TODO: change API for unlockJS to yield promises rather than events
    web3Service.on('transaction.updated', async (transactionHash, update) => {
      if (update.lock) {
        const lock = await getLockAtAddress(update.lock)
        addToLocks(lock)
      }
    })

    // For each of the hashes, let's retrieve the transaction
    hashes.forEach(hash => {
      web3Service.getTransaction(hash)
    })
  }

  /**
   * Retrieves the locks when initialized
   * Both by retrieving them from the graph and by retrieving pending transactions
   */
  useEffect(() => {
    retrieveLocks()
    retrieveLockCreationTransactions()
  }, [owner])

  /**
   * Function to create a lock to be added to the list of locks
   * @param {*} lock
   */
  const addLock = async (lock, callback) => {
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
        owner: lock.owner,
        name: lock.name,
        currencyContractAddress: lock.currencyContractAddress,
      },
      (createLockError, transactionHash) => {
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
          // Store the hash!
          storageService.storeTransaction(
            transactionHash,
            owner,
            unlockAddress,
            network.name
          )

          addToLocks(lock)
          callback(null, lock)
        }
      }
    )
  }

  return { error, loading, locks, addLock }
}

export default useLocks
