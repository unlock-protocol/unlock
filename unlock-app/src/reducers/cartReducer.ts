import { ADD_TO_CART } from '../actions/keyPurchase'
import { Action } from '../unlockTypes'

// Right now, the "cart" can only contain one lock at a time
interface State {
  lock: any
  tip: any
}

export const initialState: State = {
  lock: null,
  tip: null,
}

const cartReducer = (state = initialState, action: Action) => {
  if (action.type === ADD_TO_CART) {
    const { lock, tip } = action
    state = { lock, tip }
  }

  return state
}

export default cartReducer
