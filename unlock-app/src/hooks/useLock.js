import { useState, useContext, useEffect } from 'react'
import { Web3ServiceContext } from '../utils/withWeb3Service'
import { ConfigContext } from '../utils/withConfig'

/**
 * A hook which yield a lock, tracks its state changes, and (TODO) provides methods to update it
 * @param {*} lock
 */
export const useLock = lockFromProps => {
  const [lock, setLock] = useState(lockFromProps)
  const web3Service = useContext(Web3ServiceContext)
  const config = useContext(ConfigContext)

  /**
   * Event handler
   * @param {*} hash
   * @param {*} update
   */
  const onTransaction = (hash, update) => {
    if (lock.creationTransaction && hash === lock.creationTransaction.hash) {
      lock.creationTransaction = {
        ...lock.creationTransaction,
        ...update,
      }
      if (
        lock.creationTransaction.confirmations >= config.requiredConfirmations
      ) {
        // No need to track the transaction anymore!
        delete lock.creationTransaction
      }
      setLock(lock)
    }
  }

  useEffect(() => {
    if (lockFromProps.creationTransaction) {
      // Let's monitor the transaction!
      web3Service.on('transaction.updated', onTransaction)

      // TODO : change web3Service to return Promises of transaction
      // And implement polling here rather than inside of web3Service.getTransaction
      web3Service.getTransaction(
        lockFromProps.creationTransaction.hash,
        lockFromProps.creationTransaction
      )
    }
    return () => {
      if (lockFromProps.creationTransaction) {
        web3Service.off('transaction.updated', onTransaction)
      }
    }
  }, [lockFromProps.address])

  return { lock }
}

export default useLock
