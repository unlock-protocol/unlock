import { UPDATE_LOCK } from '../actions/lock'
import StorageService from '../services/storageService'
import {
  setLockName,
  storageError,
  STORE_LOCK_CREATION,
  STORE_LOCK_UPDATE,
} from '../actions/storage'

import configure from '../config'

const { services } = configure(global)

export default function storageMiddleware({ dispatch }) {
  const storageService = new StorageService(services.storage.host)
  return function(next) {
    return function(action) {
      switch (action.type) {
        case STORE_LOCK_CREATION:
          storageService
            .storeLockDetails(action.lock, action.token)
            .catch(error => {
              dispatch(storageError(error))
            })
          break
        case UPDATE_LOCK:
          if (!action.update.transaction) {
            storageService
              .lockLookUp(action.address)
              .then(results => {
                dispatch(setLockName(action.address, results.data.name))
              })
              .catch(error => {
                dispatch(storageError(error))
              })
          }
          break
        case STORE_LOCK_UPDATE:
          storageService
            .updateLockDetails(
              action.lockAddress,
              {
                currentAddress: action.lockAddress,
                address: action.update,
                owner: action.owner,
              },
              action.token
            )
            .then(() => {
              storageService
                .lockLookUp(action.update)
                .then(results => {
                  dispatch(setLockName(action.update, results.data.name))
                })
                .catch(error => {
                  dispatch(storageError(error))
                })
            })
            .catch(error => {
              dispatch(storageError(error))
            })

          break
      }
      next(action)
    }
  }
}
