import { SET_NETWORK } from '../actions/network'
import configure from '../config'

const config = configure()
const name = config.requiredNetworkId

export const initialState = {
  name,
}

const networkReducer = (state = initialState, action) => {
  if (action.type === SET_NETWORK) {
    return {
      name: action.network,
    }
  }

  return {
    ...state,
  }
}

export default networkReducer
