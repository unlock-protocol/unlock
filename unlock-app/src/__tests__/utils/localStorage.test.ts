import {
  localStorageAvailable,
  getItem,
  setItem,
} from '../../utils/localStorage'
import { LocalStorageWindow } from '../../windowTypes'

let mockWindow: LocalStorageWindow

const setup = () => {
  mockWindow = {
    localStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 15,
      key: jest.fn(),
    },
  }
}

describe('localStorage utils', () => {
  describe('localStorageAvailable', () => {
    beforeEach(() => {
      setup()
    })

    it('should return false when localStorage does not exist', () => {
      expect.assertions(1)
      ;(mockWindow as any).localStorage = undefined

      const result = localStorageAvailable(mockWindow)

      expect(result).toBeFalsy()
    })

    it('should return false when setItem throws', () => {
      expect.assertions(1)

      mockWindow.localStorage.setItem = jest.fn(() => {
        throw new Error('an error')
      })

      const result = localStorageAvailable(mockWindow)

      expect(result).toBeFalsy()
    })

    it('should return true if we can set and remove items', () => {
      expect.assertions(1)

      const result = localStorageAvailable(mockWindow)
      expect(result).toBeTruthy()
    })
  })

  describe('getItem', () => {
    beforeEach(() => {
      setup()
    })

    it('should return null if localStorage is not available', () => {
      expect.assertions(1)
      ;(mockWindow as any).localStorage = undefined

      const result = getItem(mockWindow, 'neato')

      expect(result).toBeNull()
    })

    it('should return what the internal getItem returns if storage is available', () => {
      expect.assertions(1)

      mockWindow.localStorage.getItem = jest.fn(() => 'a result')

      const result = getItem(mockWindow, 'neato')

      expect(result).toEqual('a result')
    })
  })

  describe('setItem', () => {
    beforeEach(() => {
      setup()
    })

    it('should return false if localStorage is not available', () => {
      expect.assertions(1)
      ;(mockWindow as any).localStorage = undefined

      const result = setItem(mockWindow, 'a key', 'a value')

      expect(result).toBeFalsy()
    })

    it('should return false if the internal setItem throws', () => {
      expect.assertions(1)

      // Works on the first check, throws when setting a new value
      mockWindow.localStorage.setItem = jest
        .fn()
        .mockImplementationOnce(() => {})
        .mockImplementationOnce(() => {
          throw new Error('an error')
        })

      const result = setItem(mockWindow, 'a key', 'a value')

      expect(result).toBeFalsy()
    })

    it('should return true if it could set the value', () => {
      expect.assertions(1)

      const result = setItem(mockWindow, 'a key', 'a value')

      expect(result).toBeTruthy()
    })
  })
})
