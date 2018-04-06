const initialState = {
}

const lockReducer = (state = initialState, action) => {
  // We should pick the lock based on the path?

  if (action.type === 'CONTRACT_INITIALIZED' && action.contract.name === 'Lock') {
    return action.contract.address
  }

  return state
}

export default lockReducer
