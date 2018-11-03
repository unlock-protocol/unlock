import { SET_ETHER_CONVERSION_RATE } from '../actions/currencyconvert'

export const initialState = {
  USD: undefined,
}

const currencyReducer = (state = initialState, action) => {
  if (action.type === SET_ETHER_CONVERSION_RATE) {
    return { ...state, [action.currency]: action.rateFor1Eth }
  }

  return state
}

export default currencyReducer
