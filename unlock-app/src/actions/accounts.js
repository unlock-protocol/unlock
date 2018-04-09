export const ACCOUNTS_FETCHED = 'ACCOUNTS_FETCHED'
export const SET_ACCOUNT = 'SET_ACCOUNT'
export const REQUEST_ACCOUNTS = 'REQUEST_ACCOUNTS'

export const setAccount = account => ({
  type: SET_ACCOUNT,
  account
})

export const requestAccounts = account => ({
  type: REQUEST_ACCOUNTS
})

export const accountsFetched = (accounts) => ({
  type: ACCOUNTS_FETCHED,
  accounts
})
