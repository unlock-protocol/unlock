import { SET_ENCRYPTED_PRIVATE_KEY } from '../actions/user'
import { Action, EncryptedPrivateKey } from '../unlockTypes' // eslint-disable-line no-unused-vars

type State = { key: EncryptedPrivateKey; email: string } | null
export const initialState: State = null

const privateKeyReducer = (
  state: State = initialState,
  action: Action
): State => {
  // NOTE: this reducer is unlike the others in that it ignores SET_ACCOUNT,
  // SET_NETWORK, and SET_PROVIDER. This is by design, the user details should
  // be retained even when those actions are dispatched.

  if (action.type === SET_ENCRYPTED_PRIVATE_KEY) {
    return {
      key: action.key,
      email: action.emailAddress,
    }
  }

  return state
}

export default privateKeyReducer
