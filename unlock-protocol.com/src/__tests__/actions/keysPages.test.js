import {
  setKeysOnPageForLock,
  SET_KEYS_ON_PAGE_FOR_LOCK,
} from '../../actions/keysPages'

describe('key actions', () => {
  it('should create an action to set the keys for lock on a given page', () => {
    expect.assertions(1)
    const page = '10'
    const lock = '0x123'
    const keys = [{}, {}]
    const expectedAction = {
      type: SET_KEYS_ON_PAGE_FOR_LOCK,
      page,
      lock,
      keys,
    }
    expect(setKeysOnPageForLock(page, lock, keys)).toEqual(expectedAction)
  })
})
