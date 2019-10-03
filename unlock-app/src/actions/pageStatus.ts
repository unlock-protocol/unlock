export const SET_LOCKED_STATE = 'accountsIframe/setLockedState'

export const setLockedState = (isLocked: boolean) => ({
  type: SET_LOCKED_STATE,
  isLocked,
})
