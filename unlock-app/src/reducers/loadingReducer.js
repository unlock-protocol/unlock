import { START_LOADING, DONE_LOADING } from '../actions/loading'

export const initialState = 0

const loadingReducer = (state = initialState, action) => {
  if (action.type === START_LOADING) {
    return state + 1
  }

  if (action.type === DONE_LOADING) {
    return state - 1
  }

  return state
}

export default loadingReducer
