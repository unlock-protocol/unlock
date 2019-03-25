import { SHOW_FORM,
         HIDE_FORM,
} from '../actions/lockFormVisibility'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'
import { SET_ACCOUNT } from '../actions/accounts'

export const initialState = {
  visible: false,
}

const lockFormVisibilityReducer = (state = initialState,
                                   action: { type: string }) => {
  if ([SET_PROVIDER, SET_NETWORK, SET_ACCOUNT].indexOf(action.type) > -1) {
    return initialState
  }

  if (action.type === SHOW_FORM) {
    return {
      visible: true,
    }
  }

  if (action.type === HIDE_FORM) {
    return initialState
  }

  return state
}

export default lockFormVisibilityReducer
