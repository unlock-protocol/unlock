import React from 'react'
import * as rtl from '@testing-library/react'
import useLocalStorage from '../../../hooks/browser/useLocalStorage'
import { WindowContext } from '../../../hooks/browser/useWindow'

jest.mock('../../../utils/localStorage')

describe('useLocalStorage hook', () => {
  let fakeWindow
  let setValue

  function MockStorage() {
    const [value, thisValue] = useLocalStorage('hi')
    setValue = thisValue
    return <div>{value}</div>
  }

  function Wrapper() {
    return (
      <WindowContext.Provider value={fakeWindow}>
        <MockStorage />
      </WindowContext.Provider>
    )
  }
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

    let wrapper
    rtl.act(() => {
      wrapper = rtl.render(<Wrapper />)
    })

    expect(wrapper.getByText('there')).not.toBeNull()
    expect(typeof setValue).toBe('function')
  })
  it('sets the value of the localStorage key when the setter is called', () => {
    expect.assertions(1)
    fakeWindow.storage.hi = 'there'

    rtl.act(() => {
      rtl.render(<Wrapper />)
    })

    rtl.act(() => setValue('wow'))

    expect(fakeWindow.localStorage.setItem).toHaveBeenCalledWith('hi', 'wow')
  })
  it('only sets the value when changed', () => {
    expect.assertions(5)

    fakeWindow.storage.hi = 'there'

    rtl.act(() => {
      rtl.render(<Wrapper />)
    })

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
