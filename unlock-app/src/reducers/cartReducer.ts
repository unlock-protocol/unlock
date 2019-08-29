import { ADD_TO_CART, UPDATE_PRICE } from '../actions/keyPurchase'
import { Action } from '../unlockTypes'

// Right now, the "cart" can only contain one lock at a time. It only responds
// to an action created by the postOfficeMiddleware while a user account key
// purchase is in progress
interface State {
  lock: any
  tip: any
  price?: number
}

export const initialState: State = {
  lock: null,
  tip: null,
}

const cartReducer = (state = initialState, action: Action) => {
  if (action.type === ADD_TO_CART) {
    const { lock, tip } = action
    state = { lock, tip }
  } else if (action.type === UPDATE_PRICE) {
    const { fees } = action
    state = Object.assign({}, state, { fees })
  }

  return state
}

export default cartReducer
