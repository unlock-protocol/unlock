import { SET_ACCOUNT } from '../actions/accounts'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'
import { GOT_BULK_METADATA } from '../actions/keyMetadata'
import { Action } from '../unlockTypes'

interface State {
  [lockAddress: string]: {
    [userAddress: string]: {
      public?: { [key: string]: string }
      protected?: { [key: string]: string }
    }
  }
}

export interface Datum {
  userAddress: string
  data: {
    userMetadata: {
      protected?: {
        [key: string]: string
      }
      public?: {
        [key: string]: string
      }
    }
  }
}

export const initialState: State = {}

const metadataReducer = (state = initialState, action: Action) => {
  if ([SET_ACCOUNT, SET_NETWORK, SET_PROVIDER].indexOf(action.type) > -1) {
    state = initialState
  }

  if (action.type === GOT_BULK_METADATA) {
    const { lockAddress, data } = action
    const normalizedLockAddress = lockAddress.toLowerCase()
    const bulkData: Datum[] = data

    // make sure we always have a bucket to put our metadata into
    if (!state[normalizedLockAddress]) {
      state[normalizedLockAddress] = {}
    }

    bulkData.forEach(datum => {
      const userAddress = datum.userAddress.toLowerCase()
      state[normalizedLockAddress][userAddress] = {
        public: datum.data.userMetadata.public,
        protected: datum.data.userMetadata.protected,
      }
    })
  }

  return state
}

export default metadataReducer
