const initialState = {
}

const accountReducer = (state = initialState, action) => {
  if (action.type === 'ACCOUNTS_FETCHED') {
    // By default, pick the first one
    return action.accounts[0]
  }

  if (action.type === 'SET_ACCOUNT') {
    return action.account
  }

  return state
}

export default accountReducer
