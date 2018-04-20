export const ACCOUNTS_FETCHED = 'ACCOUNTS_FETCHED'
export const SET_ACCOUNT = 'SET_ACCOUNT'

export const setAccount = account => ({
  type: SET_ACCOUNT,
  account,
})

export const accountsFetched = (accounts) => ({
  type: ACCOUNTS_FETCHED,
  accounts,
})
