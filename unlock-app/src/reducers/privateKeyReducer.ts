import { SET_ENCRYPTED_PRIVATE_KEY } from '../actions/user'
import { Action, EncryptedPrivateKey } from '../unlockTypes' // eslint-disable-line no-unused-vars

type State = { key: EncryptedPrivateKey; email: string } | null
export const initialState: State = null

const privateKeyReducer = (
  state: State = initialState,
  action: Action
): State => {
  if (action.type === SET_ENCRYPTED_PRIVATE_KEY) {
    return {
      key: action.key,
      email: action.emailAddress,
    }
  }

  return state
}

export default privateKeyReducer
