/* eslint promise/prefer-await-to-then: 0 */
import { WalletService } from '@unlock-protocol/unlock-js'

import { diff } from 'deep-object-diff'
import {
  CREATE_LOCK,
  WITHDRAW_FROM_LOCK,
  deleteLock,
  UPDATE_LOCK_KEY_PRICE,
  updateLock,
} from '../actions/lock'
import { setAccount, updateAccount } from '../actions/accounts'
import { setNetwork } from '../actions/network'
import { setError } from '../actions/error'
import { PROVIDER_READY } from '../actions/provider'
import { newTransaction } from '../actions/transaction'
import { waitForWallet, dismissWalletCheck } from '../actions/fullScreenModals'
import { ACCOUNT_POLLING_INTERVAL, ETHEREUM_NETWORKS_NAMES } from '../constants'

import { Application, Transaction, Wallet } from '../utils/Error'

import {
  FATAL_NO_USER_ACCOUNT,
  FATAL_WRONG_NETWORK,
  FATAL_NON_DEPLOYED_CONTRACT,
} from '../errors'
import { TransactionType } from '../unlockTypes'
import { hideForm } from '../actions/lockFormVisibility'
import { transactionTypeMapping } from '../utils/types'
import { getStoredPaymentDetails } from '../actions/user'
import { SIGN_DATA, signedData } from '../actions/signature'
import {
  SIGN_BULK_METADATA_REQUEST,
  signBulkMetadataResponse,
} from '../actions/keyMetadata'
import generateKeyTypedData from '../structured_data/keyMetadataTypedData'

// This middleware listen to redux events and invokes the walletService API.
// It also listen to events from walletService and dispatches corresponding actions

const walletMiddleware = config => {
  return ({ getState, dispatch }) => {
    const walletService = new WalletService(config)

    /**
     * Helper function which ensures that the walletService is ready
     * before calling it or dispatches an error
     * @param {*} callback
     */
    const ensureReadyBefore = callback => {
      if (!walletService.ready) {
        return dispatch(setError(Application.Fatal(FATAL_NO_USER_ACCOUNT)))
      }
      return callback()
    }

    walletService.on('account.updated', update => {
      if (!getState().account) return

      const currentAccount = getState().account
      const updatedAccount = { ...currentAccount, ...update }
      const difference = diff(currentAccount, updatedAccount)

      if (Object.keys(difference).length > 0) {
        dispatch(updateAccount(update))

        if (difference.emailAddress) {
          // if the update contains an email address, that means a user has
          // successfully logged in. We should fetch any extra information
          // (payment details...) that locksmith has on them.
          dispatch(getStoredPaymentDetails(difference.emailAddress))
        }
      }
    })

    /**
     * When an account was changed, we dispatch the corresponding action
     * The setAccount action will reset other relevant redux state
     */
    walletService.on('account.changed', account => {
      if (config.isServer) return
      // Let's poll to detect account changes
      setTimeout(
        walletService.getAccount.bind(walletService),
        ACCOUNT_POLLING_INTERVAL
      )

      // If the account is actually different
      if (!getState().account || getState().account.address !== account) {
        dispatch(
          setAccount({
            address: account,
          })
        )
      }
    })

    walletService.on(
      'transaction.new',
      (transactionHash, from, to, input, type, status) => {
        // At this point we know that a wallet was found, because a new transaction
        // cannot be created without it
        dispatch(dismissWalletCheck())
        dispatch(
          newTransaction({
            hash: transactionHash,
            to,
            from,
            input,
            type: transactionTypeMapping(type),
            status,
            network: getState().network.name,
          })
        )
      }
    )

    // A transaction has started, now we need to signal that we're waiting for
    // interaction with the wallet
    walletService.on('transaction.pending', () => {
      dispatch(waitForWallet())
    })

    // The wallet check overlay may be manually dismissed. When that event is
    // signaled, clear the overlay.
    walletService.on('overlay.dismissed', () => {
      dispatch(dismissWalletCheck())
    })

    walletService.on('lock.updated', (address, update) => {
      // This lock is beeing saved to the chain (that is what the update is about)
      dispatch(updateLock(address, update))
      dispatch(hideForm()) // Close the form
    })

    walletService.on('error', (error, transactionHash) => {
      // If we didn't successfully interact with the wallet, we need to clear the
      // overlay
      dispatch(dismissWalletCheck())
      const transaction = getState().transactions[transactionHash]
      if (transaction && transaction.type === TransactionType.LOCK_CREATION) {
        // delete the lock
        dispatch(deleteLock(transaction.lock))
        return dispatch(
          setError(
            Transaction.Warning(
              'Failed to create lock. Did you decline the transaction?'
            )
          )
        )
      }
      dispatch(setError(Transaction.Warning(error.message)))
    })

    /**
     * When the network has changed, we need to ensure Unlock has been deployed there and
     * get a new account as well as reset all the reducers
     */
    walletService.on('network.changed', networkId => {
      // Set the new network, which should also clean up all reducers
      dispatch(setNetwork(networkId))

      // Let's check if we're on the right network
      if (config.isRequiredNetwork && !config.isRequiredNetwork(networkId)) {
        const currentNetwork = ETHEREUM_NETWORKS_NAMES[networkId]
          ? ETHEREUM_NETWORKS_NAMES[networkId][0]
          : 'Unknown Network'
        return dispatch(
          setError(
            Application.Fatal(FATAL_WRONG_NETWORK, {
              currentNetwork,
              requiredNetworkId: config.requiredNetworkId,
            })
          )
        )
      }

      // Check if the smart contract exists
      walletService.isUnlockContractDeployed((error, isDeployed) => {
        if (error) {
          return dispatch(setError(Application.Fatal(error.message)))
        }
        if (!isDeployed) {
          return dispatch(
            setError(Application.Fatal(FATAL_NON_DEPLOYED_CONTRACT))
          )
        }
        // We need a new account!
        return walletService.getAccount(true /* createIfNone */)
      })
    })

    return function(next) {
      return function(action) {
        if (action.type === PROVIDER_READY) {
          walletService.connect(config.providers[getState().provider])
        } else if (action.type === CREATE_LOCK && action.lock.address) {
          ensureReadyBefore(() => {
            walletService.createLock({
              expirationDuration: action.lock.expirationDuration,
              keyPrice: action.lock.keyPrice,
              maxNumberOfKeys: action.lock.maxNumberOfKeys,
              owner: action.lock.owner,
              name: action.lock.name,
              currencyContractAddress: action.lock.currencyContractAddress,
            })
          })
        } else if (action.type === WITHDRAW_FROM_LOCK) {
          ensureReadyBefore(() => {
            walletService.withdrawFromLock({
              lockAddress: action.lock.address,
            })
          })
        } else if (action.type === UPDATE_LOCK_KEY_PRICE) {
          ensureReadyBefore(() => {
            walletService.updateKeyPrice({
              lockAddress: action.address,
              keyPrice: action.price,
            })
          })
        } else if (action.type === SIGN_DATA) {
          const { data, id } = action
          walletService.signDataPersonal(
            '', // account address -- unused in walletService
            data,
            (error, signature) => {
              if (error) {
                dispatch(
                  setError(Wallet.Warning('Could not sign identity data.'))
                )
              } else {
                dispatch(signedData(data, id, signature))
              }
            }
          )
        } else if (action.type === SIGN_BULK_METADATA_REQUEST) {
          const { lockAddress, owner, timestamp } = action

          // Usage from locksmith tests for metadataController
          const typedData = generateKeyTypedData({
            LockMetaData: {
              // used alias to indicate that the `address` field is a lock address.
              address: lockAddress,
              owner,
              timestamp,
            },
          })

          dispatch(waitForWallet())

          walletService.signData(owner, typedData, (error, signature) => {
            if (error) {
              dispatch(
                setError(
                  Wallet.Warning(
                    'Could not sign typed data for metadata request.'
                  )
                )
              )
            } else {
              dispatch(dismissWalletCheck())
              dispatch(
                signBulkMetadataResponse(typedData, signature, lockAddress)
              )
            }
          })
        }

        next(action)
      }
    }
  }
}

export default walletMiddleware
