import { useState, useContext, useEffect } from 'react'
import { Web3ServiceContext } from '../utils/withWeb3Service'
import { WalletServiceContext } from '../utils/withWalletService'
import { ConfigContext } from '../utils/withConfig'
import { TransactionType } from '../unlockTypes'
import { transactionTypeMapping } from '../utils/types'
/**
 * Event handler
 * @param {*} hash
 * @param {*} update
 */
export const processTransaction = async (
  web3Service,
  config,
  lock,
  setLock,
  hash,
  defaults
) => {
  const transaction = await web3Service.getTransaction(hash, defaults)

  transaction.type = transactionTypeMapping(transaction.type) // mapping

  let kind
  if (transaction.type === TransactionType.LOCK_CREATION) {
    kind = 'creationTransaction'
  } else if (transaction.type === TransactionType.UPDATE_KEY_PRICE) {
    kind = 'priceUpdateTransaction'
  } else {
    // Unknown transaction!
    return
  }

  if (transaction.confirmations <= config.requiredConfirmations) {
    // Polling if the transaction is not confirmed
    setTimeout(async () => {
      processTransaction(web3Service, config, lock, setLock, hash, defaults)
    }, config.blockTime / 2)
    setLock({
      ...lock,
      [kind]: {
        ...lock[kind],
        ...transaction,
      },
    })
  } else {
    // discarding the transaction once it's confirmed
    setLock({
      ...lock,
      [kind]: null,
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
      lock.keyPrice = newKeyPrice
      lock.priceUpdateTransaction = {
        confirmations: 0,
        createdAt: new Date().getTime(),
        hash: transactionHash,
        lock: lock.address,
        type: TransactionType.UPDATE_KEY_PRICE,
      }
      setLock({
        ...lock,
      })
      processTransaction(web3Service, config, lock, setLock, transactionHash)
      return callback()
    }
  )
}

/**
 * A hook which yield a lock, tracks its state changes, and (TODO) provides methods to update it
 * @param {*} lock
 */
export const useLock = (lockFromProps) => {
  const [lock, setLock] = useState(lockFromProps)
  const web3Service = useContext(Web3ServiceContext)
  const walletService = useContext(WalletServiceContext)
  const config = useContext(ConfigContext)

  const updateKeyPrice = (newKeyPrice, callback) => {
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

  useEffect(() => {
    if (lockFromProps.creationTransaction) {
      processTransaction(
        web3Service,
        config,
        lock,
        setLock,
        lockFromProps.creationTransaction.hash,
        lockFromProps.creationTransaction
      )
    }
    return () => {}
  }, [lockFromProps.address])

  return { lock, updateKeyPrice }
}

export default useLock
