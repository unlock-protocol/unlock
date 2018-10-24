import { SET_PROVIDER } from '../actions/provider'
import configure from '../config'

const config = configure(global)

export const initialState = Object.keys(config.providers)[0]

const providerReducer = (state = initialState, action) => {
  if (action.type === SET_PROVIDER) {
    return action.provider
  }

  return state
}

export default providerReducer
