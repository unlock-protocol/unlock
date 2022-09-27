import { Web3Service } from '@unlock-protocol/unlock-js'
import { useContext, useState, useReducer, useEffect } from 'react'
import { UNLIMITED_KEYS_COUNT } from '~/constants'
import GraphService from '~/services/graphService'
import { ConfigContext, useConfig } from '~/utils/withConfig'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface LockAtAddressProps {
  lockAddress: string
  network: number
  web3Service: Web3Service
}

const getLockAtAddress = async ({
  web3Service,
  lockAddress,
  network,
}: LockAtAddressProps) => {
  let lock
  try {
    lock = await web3Service.getLock(lockAddress, network)
    lock.unlimitedKeys = lock.maxNumberOfKeys === UNLIMITED_KEYS_COUNT
    lock.address = lockAddress
    lock.network = network
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error(
      `Could not get lock at ${lockAddress}/${network}: ${error.message}`
    )
  }
  return lock
}

export const retrieveLocks = async ({
  web3Service,
  graphService,
  owner,
  addToLocks,
  setLoading,
  network,
}: any) => {
  // The locks from the subgraph miss some important things, such as balance,
  // ERC20 info.. etc so we need to retrieve them from unlock-js too.
  // TODO: add these missing fields to the graph!
  const locks = await graphService.locksByManager(owner)

  // Sort locks to show the most recent first
  locks.sort((x: any, y: any) => {
    return parseInt(y.creationBlock) - parseInt(x.creationBlock)
  })

  const loadNext = async (locks: any, done: any) => {
    const lock = locks.shift()
    if (!lock) {
      return done()
    }
    const lockAddress = lock.address as string
    const lockFromChain = await getLockAtAddress({
      web3Service,
      lockAddress,
      network,
    })
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
      resolve(void 0)
    })
  })
}

export const useLocksByNetwork = (owner: string, network: number) => {
  const networks = useConfig()
  const web3Service = useWeb3Service()
  const config = useContext(ConfigContext)
  const [loading, setLoading] = useState(true)
  const { subgraphURI } = networks[network] ?? {}

  const graphService = new GraphService()
  graphService.connect(subgraphURI as string)

  graphService.connect(config.networks[network].subgraphURI)

  // We use a reducer so we can easily add locks as they are retrieved
  const [locks, addToLocks] = useReducer((locks: any, lock: any) => {
    if (lock === -1) {
      // Reset!
      return []
    }

    const index = locks.findIndex(
      (element: any) =>
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
   * Retrieves the locks when initialized both from the graph and from pending transactions
   */
  useEffect(() => {
    addToLocks(-1) // reset all locks!
    retrieveLocks({
      web3Service,
      graphService,
      owner,
      addToLocks,
      setLoading,
      network,
    })
  }, [owner])

  return { loading, locks }
}

export default useLocksByNetwork
