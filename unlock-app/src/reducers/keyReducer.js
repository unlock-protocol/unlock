import { SET_KEY } from '../actions/key'

const initialState = {
  expiration: 0,
  data: '',
}

const key = (state = initialState, action) => {
  if (action.type === SET_KEY) {
    return action.key
  }

  return state
}

export default key
