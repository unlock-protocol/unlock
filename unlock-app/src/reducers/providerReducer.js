import { SET_PROVIDER } from '../actions/provider'
import configure from '../config'

const config = configure(global)

let initialState = null 

if (Object.keys(config).length !== 0) {
  // By default, we start with the first provider.
  initialState = Object.keys(config.providers)[0]
}

const providerReducer = (state = initialState, action) => {
  if (action.type === SET_PROVIDER) {
    return action.provider
  }

  return state
}

export default providerReducer
