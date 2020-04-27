import * as rtl from '@testing-library/react'
import React, { useEffect } from 'react'
import useLocalStorage from '../../../hooks/browser/useLocalStorage'
import { WindowContext } from '../../../hooks/browser/useWindow'

jest.mock('../../../utils/localStorage', () => () => false)

describe('no localStorage', () => {
  let fakeWindow

  function MockStorage() {
    const [value, setValue] = useLocalStorage()
    useEffect(() => {
      setValue('nope')
    })
    return <div>{value}</div>
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
  it('does nothing', () => {
    expect.assertions(1)
    fakeWindow.localStorage.removeItem = () => {
      throw new Error('nope')
    }

    rtl.act(() => {
      rtl.render(
        <WindowContext.Provider value={fakeWindow}>
          <MockStorage />
        </WindowContext.Provider>
      )
    })
    expect(fakeWindow.localStorage.setItem).not.toHaveBeenCalled()
  })
})
