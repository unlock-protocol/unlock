import { useState, useContext, useEffect } from 'react'
import { Web3ServiceContext } from '../utils/withWeb3Service'
import { WalletServiceContext } from '../utils/withWalletService'
import { ConfigContext } from '../utils/withConfig'
import { TransactionType } from '../unlockTypes'

/**
 * A hook which yield a lock, tracks its state changes, and (TODO) provides methods to update it
 * @param {*} lock
 */
export const useLock = lockFromProps => {
  const [lock, setLock] = useState(lockFromProps)
  const web3Service = useContext(Web3ServiceContext)
  const walletService = useContext(WalletServiceContext)
  const config = useContext(ConfigContext)

  /**
   * Event handler
   * @param {*} hash
   * @param {*} update
   */
  const onTransaction = (hash, update) => {
    const lockTransactions = ['creationTransaction', 'priceUpdateTransaction']
    lockTransactions.forEach(transaction => {
      if (lock[transaction] && hash === lock[transaction].hash) {
        lock[transaction] = {
          ...lock[transaction],
          ...update,
        }
        if (lock[transaction].confirmations >= config.requiredConfirmations) {
          // No need to track the transaction anymore!
          delete lock[transaction]
        }
        setLock(lock)
      }
    })
  }

  /**
   * Function called to updated the price of a lock
   */
  const updateKeyPrice = (newKeyPrice, callback) => {
    walletService.updateKeyPrice(
      {
        lockAddress: lockFromProps.address,
        keyPrice: newKeyPrice,
      },
      (error, transactionHash) => {
        lock.keyPrice = newKeyPrice
        lock.priceUpdateTransaction = {
          confirmations: 0,
          createdAt: new Date().getTime(),
          hash: transactionHash,
          lock: lockFromProps.address,
          type: TransactionType.UPDATE_KEY_PRICE,
        }
        setLock(lock)
        web3Service.on('transaction.updated', onTransaction)

        return callback()
      }
    )
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
      web3Service.off('transaction.updated', onTransaction)
    }
  }, [lockFromProps.address])

  return { lock, updateKeyPrice }
}

export default useLock
