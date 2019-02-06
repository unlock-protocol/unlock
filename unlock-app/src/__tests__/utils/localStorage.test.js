import {
  getKeysFromStorage,
  getUserStorageName,
  getKeysForLockFromStorage,
  resetAccountStorage,
  saveKeyToStorage,
} from '../../utils/localStorage'

describe('localStorage utility', () => {
  let window
  let fakeStorage
  const account = '0x123'
  const network = 1
  const user = getUserStorageName(account, network)
  const lock1 = '0xdeadbeef'
  const lock2 = '0xfadebeef'
  const key1 = {
    lock: lock1,
    owner: account,
    expiration: 0,
    data: null,
    id: `${lock1}-${account}`,
  }
  const key2 = {
    lock: lock2,
    owner: account,
    expiration: 0,
    data: null,
    id: `${lock1}-${account}`,
  }
  beforeEach(() => {
    fakeStorage = {}
    window = {
      localStorage: {
        setItem: jest.fn((item, thing) => (fakeStorage[item] = thing)),
        getItem: jest.fn(item => fakeStorage[item] || null),
        removeItem: jest.fn(() => null),
      },
    }
  })
  describe('getKeysFromStorage', () => {
    it("pulls the user's keys from storage", () => {
      expect.assertions(1)
      const info = {
        [key1.id]: key1,
      }
      fakeStorage[user] = JSON.stringify(info)
      expect(getKeysFromStorage(window, account, network)).toEqual(info)
    })
  })
  describe('getKeysForLockFromStorage', () => {
    it("pulls the specific lock's keys from storage", () => {
      expect.assertions(2)
      const info = {
        [lock1]: {
          [key1.id]: key1,
        },
        [lock2]: {
          [key2.id]: key2,
        },
      }
      fakeStorage[user] = JSON.stringify(info)
      expect(
        getKeysForLockFromStorage(window, lock1, account, network)
      ).toEqual({
        [key1.id]: key1,
      })
      expect(
        getKeysForLockFromStorage(window, lock2, account, network)
      ).toEqual({
        [key2.id]: key2,
      })
    })
  })
  it('resetAccountStorage', () => {
    expect.assertions(1)
    resetAccountStorage(window, account, network)
    expect(window.localStorage.removeItem).toHaveBeenCalledWith(user)
  })
  describe('saveKeyToStorage', () => {
    const expectedValue = {
      [lock1]: {
        [key1.id]: key1,
      },
    }
    it('sets value correctly when localStorage is empty', () => {
      expect.assertions(2)
      saveKeyToStorage(window, key1, network)

      expect(window.localStorage.getItem).toHaveBeenCalledWith(user)
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        user,
        JSON.stringify(expectedValue)
      )
    })
    it('sets value correctly when localStorage has other locks', () => {
      const newValue = {
        [lock2]: {
          [key2.id]: key2,
        },
      }
      fakeStorage[user] = JSON.stringify(newValue)
      expect.assertions(2)
      saveKeyToStorage(window, key1, network)

      expect(window.localStorage.getItem).toHaveBeenCalledWith(user)
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        user,
        JSON.stringify({
          ...newValue,
          ...expectedValue,
        })
      )
    })
    it('sets value correctly when localStorage has the same key already', () => {
      fakeStorage[user] = JSON.stringify(expectedValue)
      expect.assertions(2)
      saveKeyToStorage(window, key1, network)

      expect(window.localStorage.getItem).toHaveBeenCalledWith(user)
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        user,
        JSON.stringify(expectedValue)
      )
    })
  })
})
