import { SET_ACCOUNT } from '../actions/accounts'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'
import { GOT_METADATA } from '../actions/keyMetadata'
import { Action } from '../unlockTypes'

interface State {
  [lockAddress: string]: {
    [keyId: string]: {
      public?: { [key: string]: string }
      protected?: { [key: string]: string }
    }
  }
}

export const initialState: State = {}

const metadataReducer = (state = initialState, action: Action) => {
  if ([SET_ACCOUNT, SET_NETWORK, SET_PROVIDER].indexOf(action.type) > -1) {
    state = initialState
  }

  if (action.type === GOT_METADATA) {
    const { lockAddress, keyId, data } = action
    if (state[lockAddress]) {
      state[lockAddress][keyId] = data
    } else {
      state[lockAddress] = {
        [keyId]: data,
      }
    }
  }

  return state
}

export default metadataReducer
