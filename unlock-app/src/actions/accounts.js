export const SET_ACCOUNT = 'SET_ACCOUNT'
export const CREATE_ACCOUNT = 'CREATE_ACCOUNT'
export const RESET_ACCOUNT_BALANCE = 'RESET_ACCOUNT_BALANCE'
export const LOAD_ACCOUNT = 'LOAD_ACCOUNT'

export const setAccount = account => ({
  type: SET_ACCOUNT,
  account,
})

export const createAccount = account => ({
  type: CREATE_ACCOUNT,
})

export const resetAccountBalance = (balance) => ({
  type: RESET_ACCOUNT_BALANCE,
  balance,
})

export const loadAccount = (privateKey) => ({
  type: LOAD_ACCOUNT,
  privateKey,
})
