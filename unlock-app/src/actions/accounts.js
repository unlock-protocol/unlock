export const SET_ACCOUNT = 'SET_ACCOUNT'
export const CREATE_ACCOUNT = 'CREATE_ACCOUNT'
export const LOAD_ACCOUNT = 'LOAD_ACCOUNT'

export const createAccount = () => ({
  type: CREATE_ACCOUNT,
})

export const setAccount = account => ({
  type: SET_ACCOUNT,
  account,
})

export const loadAccount = (privateKey) => ({
  type: LOAD_ACCOUNT,
  privateKey,
})
