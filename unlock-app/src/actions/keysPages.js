export const SET_KEYS_ON_PAGE_FOR_LOCK = 'keysPages/SET_KEYS_ON_PAGE_FOR_LOCK'

export const setKeysOnPageForLock = (page, lock, keys) => ({
  type: SET_KEYS_ON_PAGE_FOR_LOCK,
  page,
  lock,
  keys,
})
