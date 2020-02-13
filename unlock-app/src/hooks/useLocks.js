import { useState, useEffect, useContext } from 'react'
import { UNLIMITED_KEYS_COUNT } from '../constants'
import { Web3ServiceContext } from '../utils/withWeb3Service'

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
  const [loading, setLoading] = useState(true)
  const [locks, setLocks] = useState([])
  const web3Service = useContext(Web3ServiceContext)

  // TODO Load thru context
  const { subgraphURI } = config
  const graphService = new GraphService(subgraphURI)

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
      // HACK: We delay each lock by 300ms to avoid rate limits...
      await new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 300 * index)
      })

      const lock = await web3Service.getLock(address)
      lock.unlimitedKeys = lock.maxNumberOfKeys === UNLIMITED_KEYS_COUNT
      lock.address = address
      return lock
    })

    const locks = await Promise.all(lockPromises)
    setLocks(locks)
    setLoading(false)
  }

  useEffect(() => {
    retrieveLocks()
  }, [owner])

  return [loading, locks]
}

export default useLocks
