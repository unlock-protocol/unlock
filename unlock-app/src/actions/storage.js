export const SET_LOCK_NAME = 'SET_LOCK_NAME'

export function setLockName(address, name) {
  return {
    type: 'SET_LOCK_NAME',
    address: address,
    name: name,
  }
}
