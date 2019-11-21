/* eslint promise/prefer-await-to-then: 0 */

import { Web3Service } from '@unlock-protocol/unlock-js'
import { CREATE_LOCK, GET_LOCK, updateLock, createLock } from '../actions/lock'

import { startLoading, doneLoading } from '../actions/loading'
import { updateAccount, SET_ACCOUNT } from '../actions/accounts'
import { setError } from '../actions/error'
import {
  addTransaction,
  updateTransaction,
  ADD_TRANSACTION,
  NEW_TRANSACTION,
} from '../actions/transaction'
import { PGN_ITEMS_PER_PAGE, UNLIMITED_KEYS_COUNT } from '../constants'

import {
  SET_KEYS_ON_PAGE_FOR_LOCK,
  setKeysOnPageForLock,
} from '../actions/keysPages'
import { transactionTypeMapping } from '../utils/types'
import { Web3 } from '../utils/Error'
import GraphService from '../services/graphService'

// This middleware listen to redux events and invokes the web3Service API.
// It also listen to events from web3Service and dispatches corresponding actions
const web3Middleware = config => {
  const {
    readOnlyProvider,
    unlockAddress,
    blockTime,
    requiredConfirmations,
    subgraphURI,
  } = config
  return ({ getState, dispatch }) => {
    const web3Service = new Web3Service({
      readOnlyProvider,
      unlockAddress,
      blockTime,
      requiredConfirmations,
    })

    const graphService = new GraphService(subgraphURI)

    web3Service.on('account.updated', (account, update) => {
      dispatch(updateAccount(update))
    })

    /**
     * The Lock was changed.
     * Should we get the balance of the lock owner?
     */
    web3Service.on('lock.updated', (address, update) => {
      const lock = getState().locks[address]

      // Our app defines a unlimitedKeys boolean
      if (update.maxNumberOfKeys) {
        update.unlimitedKeys = update.maxNumberOfKeys === UNLIMITED_KEYS_COUNT
      }

      // Only dispatch the updates which are more recent than the current value
      if (!lock || !lock.asOf || lock.asOf < update.asOf) {
        dispatch(updateLock(address, update))
      }
    })

    web3Service.on('transaction.updated', (transactionHash, update) => {
      // Mapping the transaction type
      if (update.type) {
        update.type = transactionTypeMapping(update.type)
      }
      dispatch(updateTransaction(transactionHash, update))
    })

    web3Service.on('transaction.new', transactionHash => {
      dispatch(
        addTransaction({
          hash: transactionHash,
          network: getState().network.name,
        })
      )
    })

    web3Service.on('error', error => {
      const { message } = error
      // TODO: better handling of these errors? We can't separate them
      // by level right now, so they're all diagnostic.
      dispatch(setError(Web3.Diagnostic(message)))
    })

    web3Service.on('keys.page', (lock, page, keys) => {
      dispatch(setKeysOnPageForLock(page, lock, keys))
    })

    return function(next) {
      return function(action) {
        // When the keys for a lock are loaded on the dashboard
        if (action.type === SET_KEYS_ON_PAGE_FOR_LOCK) {
          if (!action.keys) {
            web3Service.getKeysForLockOnPage(
              action.lock,
              action.page,
              PGN_ITEMS_PER_PAGE
            )
          }
        }

        if (action.type === ADD_TRANSACTION) {
          dispatch(startLoading())
          web3Service
            .getTransaction(action.transaction.hash, action.transaction)
            .then(() => {
              dispatch(doneLoading())
            })
        }

        if (action.type === NEW_TRANSACTION) {
          dispatch(startLoading())
          web3Service
            .getTransaction(action.transaction.hash, action.transaction)
            .then(() => {
              dispatch(doneLoading())
            })
        }

        if (action.type === CREATE_LOCK && !action.lock.address) {
          web3Service.generateLockAddress().then(address => {
            action.lock.address = address
            dispatch(createLock(action.lock))
          })
        }

        if (action.type === GET_LOCK) {
          web3Service.getLock(action.address)
        }

        if (action.type === SET_ACCOUNT) {
          dispatch(startLoading())
          graphService.locksByOwner(action.account.address).then(locks => {
            // The locks from the subgraph miss some important things, such as balance,
            // ERC20 info.. etc so we need to retrieve them from unlock-js too.
            // TODO: add these missing fields to the graph!
            locks.forEach((lock, index) => {
              dispatch(updateLock(lock.address, lock))
              // HACK: We delay each lock by 200ms to avoid rate limits...
              setTimeout(() => {
                web3Service.getLock(lock.address)
              }, 200 * index)
            })
            dispatch(doneLoading())
          })
        }

        next(action)
      }
    }
  }
}

export default web3Middleware
