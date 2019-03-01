import * as rtl from 'react-testing-library'
import useLocalStorage from '../../../hooks/browser/useLocalStorage'

jest.mock('../../../utils/localStorage', () => () => false)

describe('no localStorage', () => {
  let fakeWindow

  beforeEach(() => {
    jest.resetModules()
    fakeWindow = {
      storage: {},
      localStorage: {
        setItem: jest.fn((x, y) => (fakeWindow.storage[x] = y)),
        getItem: jest.fn(x => fakeWindow.storage[x]),
        removeItem: () => {},
      },
    }
  })
  it('does nothing', () => {
    expect.assertions(2)
    fakeWindow.localStorage.removeItem = () => {
      throw new Error('nope')
    }

    const {
      result: {
        current: [, setValue],
      },
    } = rtl.testHook(() => useLocalStorage(fakeWindow, 'hi'))

    expect(fakeWindow.localStorage.setItem).not.toHaveBeenCalled()

    rtl.act(() => setValue('nope'))

    expect(fakeWindow.localStorage.setItem).not.toHaveBeenCalled()
  })
})
