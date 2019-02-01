import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import createUnlockStore from '../../createUnlockStore'
import Paywall, { mapStateToProps } from '../../pages/paywall'
import { lockPage, unlockPage } from '../../services/iframeService'
import { ConfigContext } from '../../utils/withConfig'

jest.mock('../../services/iframeService.js')

const lock = { address: '0x4983D5ECDc5cc0E499c2D23BF4Ac32B982bAe53a' }
const locks = {
  [lock.address]: lock,
}
const router = {
  location: {
    pathname: `/paywall/${lock.address}`,
    search: '',
    hash: '',
  },
}

let futureDate = new Date()
futureDate.setYear(futureDate.getFullYear() + 1)
futureDate = futureDate.getTime() / 1000

const keys = {
  aKey: {
    lock: lock.address,
    expiration: futureDate,
  },
}
const modals = []

const store = createUnlockStore({ locks, keys, modals, router })
const noKeyStore = createUnlockStore({ locks, keys: {}, modals, router })

afterEach(() => {
  rtl.cleanup()
  jest.clearAllMocks()
})
describe('Paywall', () => {
  describe('mapStateToProps', () => {
    it('should yield the lock which matches the address of the demo page', () => {
      const props = mapStateToProps({ locks, keys, modals, router })
      expect(props.locks[0]).toBe(lock)
    })
    it('should be locked when no keys are available', () => {
      const props = mapStateToProps({ locks, keys: {}, modals, router })
      expect(props.locked).toBe(true)
    })
    it('should not be locked when there is a matching key', () => {
      const props = mapStateToProps({ locks, keys, modals, router })
      expect(props.locked).toBe(false)
    })
  })
  describe('handleIframe', () => {
    it('should call lockPage when it is locked', () => {
      expect.assertions(2)
      rtl.render(
        <Provider store={noKeyStore}>
          <Paywall />
        </Provider>
      )
      expect(lockPage).toHaveBeenCalled()
      expect(unlockPage).not.toHaveBeenCalled()
    })
    it('should call unlockPage when it is not locked', () => {
      expect.assertions(2)
      rtl.render(
        <ConfigContext.Provider value={{ providers: [] }}>
          <Provider store={store}>
            <Paywall />
          </Provider>
        </ConfigContext.Provider>
      )
      expect(lockPage).not.toHaveBeenCalled()
      expect(unlockPage).toHaveBeenCalled()
    })
  })
})
