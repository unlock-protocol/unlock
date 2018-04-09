import { SET_CURRENT_KEY } from '../actions/lock'

const initialState = {
  expiration: 0,
  data: ''
}

const currentKey = (state = initialState, action) => {
  if (action.type === SET_CURRENT_KEY) {
    return action.key
  }

  return state
}

export default currentKey
