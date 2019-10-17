import { SET_LOCKED_STATE } from '../actions/pageStatus'
import { Action } from '../unlockTypes'

export const initialState: boolean = false

const pageStatusReducer = (state = initialState, action: Action) => {
  if (action.type === SET_LOCKED_STATE) {
    state = action.isLocked
  }

  return state
}

export default pageStatusReducer
