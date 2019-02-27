import reducer, { initialState } from '../../reducers/keysPagesReducer'
import { SET_KEYS_ON_PAGE_FOR_LOCK } from '../../actions/keysPages'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'
import { SET_ACCOUNT } from '../../actions/accounts'

describe('keys page reducer', () => {
  const oneKey = {
    id: 'keyId',
    expiration: 0,
    data: 'hello',
  }

  const anotherKey = {
    id: 'keyId2',
    expiration: 100,
    data: 'world',
  }

  it('should return the initial state', () => {
    expect.assertions(1)
    expect(reducer(undefined, {})).toEqual({})
  })

  it('should return the initial state when receveing SET_PROVIDER', () => {
    expect.assertions(1)
    const state = {
      '0x123': {
        keys: [],
        page: 100,
      },
    }
    expect(
      reducer(state, {
        type: SET_PROVIDER,
      })
    ).toBe(initialState)
  })

  it('should return the initial state when receveing SET_NETWORK', () => {
    expect.assertions(1)
    const state = {
      '0x123': {
        keys: [],
        page: 100,
      },
    }

    expect(
      reducer(state, {
        type: SET_NETWORK,
      })
    ).toBe(initialState)
  })

  // Upon changing account, we need to clear the existing keys on the page. The web3 middleware will
  // re-populate them
  it('should clear the keys on page when receiving SET_ACCOUNT', () => {
    expect.assertions(1)
    const account = {}
    const state = {
      '0x123': {
        keys: [],
        page: 100,
      },
    }
    expect(
      reducer(state, {
        type: SET_ACCOUNT,
        account,
      })
    ).toBe(initialState)
  })

  describe('SET_KEYS_ON_PAGE_FOR_LOCK', () => {
    it('should set the keys on that page accordingly', () => {
      expect.assertions(1)
      const state = {}
      const action = {
        type: SET_KEYS_ON_PAGE_FOR_LOCK,
        page: 0,
        lock: '0x123',
        keys: [oneKey, anotherKey],
      }

      expect(reducer(state, action)).toEqual({
        '0x123': {
          page: 0,
          keys: [oneKey, anotherKey],
        },
      })
    })

    it('should set the keys on that page accordingly even when a value was previously set', () => {
      expect.assertions(1)
      const state = {
        '0x123': {
          page: 1,
          keys: [],
        },
      }

      const action = {
        type: SET_KEYS_ON_PAGE_FOR_LOCK,
        page: 0,
        lock: '0x123',
        keys: [oneKey, anotherKey],
      }

      expect(reducer(state, action)).toEqual({
        '0x123': {
          page: 0,
          keys: [oneKey, anotherKey],
        },
      })
    })
  })
})
