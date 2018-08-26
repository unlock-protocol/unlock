import { SET_PROVIDER } from '../actions/provider'
import configure from '../config'

const config = configure(global)

// By default, we start with the first provider.
const initialState = Object.keys(config.providers)[0] || null

const providerReducer = (state = initialState, action) => {
  if (action.type === SET_PROVIDER) {
    return action.provider
  }

  return state
}

export default providerReducer
