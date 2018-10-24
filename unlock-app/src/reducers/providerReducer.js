import { SET_PROVIDER } from '../actions/provider'

export const initialState = null

const providerReducer = (state = initialState, action) => {
  if (action.type === SET_PROVIDER) {
    return action.provider
  }

  return state
}

export default providerReducer
