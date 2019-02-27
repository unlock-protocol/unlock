import * as rtl from 'react-testing-library'
import useLocalStorage from '../../../hooks/browser/useLocalStorage'

jest.mock('../../../utils/localStorage')

describe('useLocalStorage hook', () => {
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
  it('returns existing value of localStorage key and a setter', () => {
    expect.assertions(2)
    fakeWindow.storage.hi = 'there'

    expect.assertions(2)

    rtl.act(() => {})
    const { result } = rtl.testHook(() => useLocalStorage(fakeWindow, 'hi'))

    const [value, setter] = result.current

    expect(value).toBe('there')
    expect(typeof setter).toBe('function')
  })
  it('sets the value of the localStorage key when the setter is called', () => {
    expect.assertions(1)
    fakeWindow.storage['hi'] = 'there'

    expect.assertions(1)

    const {
      result: {
        current: [, setValue],
      },
    } = rtl.testHook(() => useLocalStorage(fakeWindow, 'hi'))

    rtl.act(() => setValue('wow'))

    expect(fakeWindow.localStorage.setItem).toHaveBeenCalledWith('hi', 'wow')
  })
  it('only sets the value when changed', () => {
    expect.assertions(5)

    fakeWindow.storage['hi'] = 'there'

    const {
      result: {
        current: [, setValue],
      },
    } = rtl.testHook(() => useLocalStorage(fakeWindow, 'hi'))
    expect(fakeWindow.localStorage.setItem).toHaveBeenCalledTimes(1)

    rtl.act(() => setValue('wow'))
    expect(fakeWindow.localStorage.setItem).toHaveBeenCalledTimes(2)

    rtl.act(() => setValue('wow'))
    expect(fakeWindow.localStorage.setItem).toHaveBeenCalledTimes(2)

    rtl.act(() => setValue('wow'))
    expect(fakeWindow.localStorage.setItem).toHaveBeenCalledTimes(2)

    rtl.act(() => setValue('wheee'))
    expect(fakeWindow.localStorage.setItem).toHaveBeenCalledTimes(3)
  })
})
