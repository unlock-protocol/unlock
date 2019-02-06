import { UPDATE_LOCK, updateLock } from '../actions/lock'
import StorageService from '../services/storageService'
import { STORE_LOCK_CREATION } from '../actions/storage'

import configure from '../config'

const { services } = configure(global)

export default function storageMiddleware({ getState, dispatch }) {
  const storageService = new StorageService(services.storage.host)
  return next => {
    return async action => {
      if (action.type === STORE_LOCK_CREATION) {
        // A new lock has been created
        await storageService.storeLockDetails(action.lock, action.token)
      }

      if (action.type === UPDATE_LOCK) {
        // Only look up the name for a lock for which the name is empty/not-set
        const lock = getState().locks[action.address]
        if (!lock.name) {
          // TODO: lockLookUp should probably return the data, not the HTTP response
          const results = await storageService.lockLookUp(action.address)
          dispatch(updateLock(action.address, { name: results.data.name }))
        }
      }

      next(action)
    }
  }
}
