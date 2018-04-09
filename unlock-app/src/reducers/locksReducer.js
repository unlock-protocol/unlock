const initialState = {
}

const locksReducer = (state = initialState, action) => {
  if (action.type === 'NEW_LOCK') {
    return [
      ...state,
      action.lockAddress
    ]
  }

  return state
}

export default locksReducer
