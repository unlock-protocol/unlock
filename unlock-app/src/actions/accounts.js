export const SET_ACCOUNT = 'SET_ACCOUNT'
export const RESET_ACCOUNT_BALANCE = 'RESET_ACCOUNT_BALANCE'

export const setAccount = account => ({
  type: SET_ACCOUNT,
  account,
})

export const resetAccountBalance = (balance) => ({
  type: RESET_ACCOUNT_BALANCE,
  balance,
})
