export const SET_ACCOUNT = 'SET_ACCOUNT'
export const UPDATE_ACCOUNT = 'UPDATE_ACCOUNT'

export const updateAccount = update => ({
  type: UPDATE_ACCOUNT,
  update,
})

export const setAccount = account => ({
  type: SET_ACCOUNT,
  account,
})
