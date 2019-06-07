import { SET_ENCRYPTED_PRIVATE_KEY } from '../actions/user'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'
import { SET_ACCOUNT } from '../actions/accounts'
import { Action, EncryptedPrivateKey } from '../unlockTypes' // eslint-disable-line no-unused-vars

type State = { key: EncryptedPrivateKey; email: string } | null
export const initialState: State = null

const privateKeyReducer = (
  state: State = initialState,
  action: Action
): State => {
  if ([SET_PROVIDER, SET_NETWORK, SET_ACCOUNT].indexOf(action.type) > -1) {
    return initialState
  }

  if (action.type === SET_ENCRYPTED_PRIVATE_KEY) {
    return {
      key: action.key,
      email: action.emailAddress,
    }
  }

  return state
}

export default privateKeyReducer
