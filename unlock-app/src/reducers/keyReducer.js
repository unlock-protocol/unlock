import { SET_KEY } from '../actions/key'
import { SET_ACCOUNT } from '../actions/accounts'

const initialState = {
  expiration: 0,
  data: '',
}

const key = (state = initialState, action) => {

  if (action.type === SET_ACCOUNT) {
    return initialState
  }

  if (action.type === SET_KEY) {
    return action.key
  }

  return state
}

export default key
