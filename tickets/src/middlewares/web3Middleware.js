/* eslint promise/prefer-await-to-then: 0 */

import { Web3Service } from '@unlock-protocol/unlock-js'

import { startLoading, doneLoading } from '../actions/loading'
import { SET_ACCOUNT, updateAccount } from '../actions/accounts'
import { updateLock, addLock } from '../actions/lock'
import { setError } from '../actions/error'
import { lockRoute } from '../utils/routes'
import { StorageService, success } from '../services/storageService'

// This middleware listen to redux events and invokes the web3Service API.
// It also listen to events from web3Service and dispatches corresponding actions
const web3Middleware = config => {
  const {
    readOnlyProvider,
    unlockAddress,
    blockTime,
    requiredConfirmations,
    services,
  } = config
  return ({ dispatch, getState }) => {
    const web3Service = new Web3Service({
      readOnlyProvider,
      unlockAddress,
      blockTime,
      requiredConfirmations,
    })

    const storageService = new StorageService(services.storage.host)

    // Get the lock details from chain
    storageService.on(success.getLockAddressesForUser, addresses => {
      addresses.forEach(address => {
        web3Service.getLock(address)
      })
    })

    web3Service.on('error', error => {
      dispatch(setError(error.message))
    })

    web3Service.on('account.updated', (account, update) => {
      dispatch(updateAccount(update))
    })

    web3Service.on('lock.updated', (address, update) => {
      const lock = getState().locks[address]
      if (lock) {
        dispatch(updateLock(address, update))
      } else {
        dispatch(addLock(address, update))
      }
    })

    let lockAddress
    if (typeof window !== 'undefined' && window.location) {
      const route = lockRoute(window.location.pathname)
      if (route.lockAddress) {
        lockAddress = route.lockAddress
      }
    }

    return function(next) {
      setTimeout(() => {
        if (lockAddress) {
          web3Service.getLock(lockAddress)
        }
      }, 0)

      return function(action) {
        next(action)

        // note: this needs to be after the reducer has seen it, because refreshAccountBalance
        // triggers 'account.update' which dispatches UPDATE_ACCOUNT. The reducer assumes that
        // ADD_ACCOUNT has reached it first, and throws an exception. Putting it after the
        // reducer has a chance to populate state removes this race condition.
        if (action.type === SET_ACCOUNT) {
          if (!lockAddress) {
            dispatch(startLoading())

            // Get lock addresses from locksmith (hint)
            storageService.getLockAddressesForUser(action.account.address)

            // Get lock addresses from chain (slow but trusted)...
            web3Service
              .getPastLockCreationsTransactionsForUser(action.account.address)
              .then(lockCreations => {
                dispatch(doneLoading())
                lockCreations.forEach(lockCreation => {
                  web3Service.getTransaction(lockCreation.transactionHash)
                })
              })
          }
        }
      }
    }
  }
}

export default web3Middleware
