import { GOT_RECOVERY_PHRASE, RESET_RECOVERY_PHRASE } from '../actions/recovery'
import { Action } from '../unlockTypes'

type State = string | null

export const initialState: State = null

const recoveryReducer = (
  state: State = initialState,
  action: Action
): State => {
  if (action.type === GOT_RECOVERY_PHRASE) {
    return action.recoveryPhrase
  }

  if (action.type === RESET_RECOVERY_PHRASE) {
    return initialState
  }

  return state
}

export default recoveryReducer
