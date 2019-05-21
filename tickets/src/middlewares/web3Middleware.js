/* eslint promise/prefer-await-to-then: 0 */

import { Web3Service } from '@unlock-protocol/unlock-js'
import { LOCATION_CHANGE } from 'connected-react-router'

import { startLoading, doneLoading } from '../actions/loading'
import { SET_ACCOUNT, updateAccount } from '../actions/accounts'
import { updateLock, addLock } from '../actions/lock'
import {
  addTransaction,
  updateTransaction,
  NEW_TRANSACTION,
  UPDATE_TRANSACTION,
} from '../actions/transaction'
import { setError } from '../actions/error'
import { transactionTypeMapping } from '../utils/types'
import { lockRoute } from '../utils/routes'
import { addKey, updateKey } from '../actions/key'
import {
  SIGNED_ADDRESS_VERIFIED,
  VERIFY_SIGNED_ADDRESS,
  signedAddressVerified,
  signedAddressMismatch,
} from '../actions/ticket'
import UnlockEventRSVP from '../structured_data/unlockEventRSVP'

// This middleware listen to redux events and invokes the web3Service API.
// It also listen to events from web3Service and dispatches corresponding actions
const web3Middleware = config => {
  const {
    readOnlyProvider,
    unlockAddress,
    blockTime,
    requiredConfirmations,
  } = config
  return ({ dispatch, getState }) => {
    const web3Service = new Web3Service({
      readOnlyProvider,
      unlockAddress,
      blockTime,
      requiredConfirmations,
    })

    // When explicitly retrieved
    web3Service.on('key.updated', (id, key) => {
      dispatch(addKey(id, key))
    })

    // When transaction succeeds
    web3Service.on('key.saved', (id, key) => {
      dispatch(addKey(id, key))
    })

    web3Service.on('error', error => {
      dispatch(setError(error.message))
    })

    web3Service.on('account.updated', (account, update) => {
      dispatch(updateAccount(update))
    })

    web3Service.on('transaction.new', transactionHash => {
      dispatch(
        addTransaction({
          hash: transactionHash,
          network: getState().network.name,
        })
      )
    })

    web3Service.on('transaction.updated', (transactionHash, update) => {
      // Mapping the transaction type
      if (update.type) {
        update.type = transactionTypeMapping(update.type)
      }
      dispatch(updateTransaction(transactionHash, update))
    })

    web3Service.on('lock.updated', (address, update) => {
      const lock = getState().locks[address]
      if (lock) {
        dispatch(updateLock(address, update))
      } else {
        dispatch(addLock(address, update))
      }
    })

    const {
      account,
      router: {
        location: { pathname },
      },
    } = getState()
    const { lockAddress } = lockRoute(pathname)

    return function(next) {
      setTimeout(() => {
        if (lockAddress) {
          web3Service.getLock(lockAddress)
        }
      }, 0)

      return function(action) {
        next(action)

        const accountAddress = account && account.address

        // note: this needs to be after the reducer has seen it, because refreshAccountBalance
        // triggers 'account.update' which dispatches UPDATE_ACCOUNT. The reducer assumes that
        // ADD_ACCOUNT has reached it first, and throws an exception. Putting it after the
        // reducer has a chance to populate state removes this race condition.
        if (action.type === SET_ACCOUNT) {
          // If there is no lock address
          if (!lockAddress) {
            // TODO: when the account has been updated we should reset web3Service and remove all listeners
            // So that pending API calls do not interract with our "new" state.
            web3Service.refreshAccountBalance(action.account)
            dispatch(startLoading())
            // TODO: only do that when on the page to create events because we do not need the list of locks for other users.
            web3Service
              .getPastLockCreationsTransactionsForUser(action.account.address)
              .then(lockCreations => {
                dispatch(doneLoading())
                lockCreations.forEach(lockCreation => {
                  web3Service.getTransaction(lockCreation.transactionHash)
                })
              })
          }
          // If there is a lock address, let's fetch the user's key
          if (lockAddress) {
            web3Service.getKeyByLockForOwner(
              lockAddress,
              action.account.address
            )
          }
        }

        if (action.type === LOCATION_CHANGE) {
          // Location was changed, get the matching lock
          if (lockAddress) {
            web3Service.getLock(lockAddress)
          }
        }

        // When a new transaction was created, retrieve it
        if (action.type === NEW_TRANSACTION) {
          web3Service.getTransaction(
            action.transaction.hash,
            action.transaction
          )
        }

        if (
          action.type === VERIFY_SIGNED_ADDRESS &&
          action.eventAddress &&
          action.publicKey &&
          action.signedAddress
        ) {
          const { publicKey, eventAddress, signedAddress } = action

          const data = UnlockEventRSVP.build({
            publicKey: publicKey,
            eventAddress: eventAddress,
          })

          web3Service
            .recoverAccountFromSignedData(JSON.stringify(data), signedAddress)
            .then(account => {
              const normalizedAccount = account.toString().toLowerCase()
              const normalizedPublicKey = publicKey.toString().toLowerCase()

              if (normalizedAccount !== normalizedPublicKey) {
                dispatch(
                  signedAddressMismatch(normalizedPublicKey, signedAddress)
                )
              } else if (normalizedAccount === normalizedPublicKey) {
                dispatch(
                  signedAddressVerified(
                    normalizedPublicKey,
                    signedAddress,
                    eventAddress
                  )
                )
              }
            })
        }

        const keyId = `${lockAddress}-${accountAddress}`
        if (action.type === UPDATE_TRANSACTION) {
          const existingTransaction = getState().transactions[action.hash]
          if (
            (existingTransaction.to === lockAddress &&
              existingTransaction.from === accountAddress) ||
            existingTransaction.key === keyId
          ) {
            // this is key purchase transaction from us to the lock!
            const key = getState().keys[keyId]

            if (key) {
              dispatch(
                updateKey(keyId, {
                  ...key,
                  transactions: {
                    ...key.transactions,
                    [action.hash]: existingTransaction,
                  },
                })
              )
            } else {
              dispatch(
                addKey(keyId, {
                  lock: lockAddress,
                  owner: accountAddress,
                  expiration: 0,
                  data: null,
                  id: keyId,
                  transactions: {
                    [action.hash]: existingTransaction,
                  },
                })
              )
            }
          }
        }

        if (
          action.type === SIGNED_ADDRESS_VERIFIED &&
          action.eventAddress &&
          action.address
        ) {
          web3Service.getKeyByLockForOwner(action.eventAddress, action.address)
        }
      }
    }
  }
}

export default web3Middleware
