import reducer, { initialState } from '../../reducers/keysReducer'
import { SET_KEY, PURCHASE_KEY } from '../../actions/key'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'
import { SET_ACCOUNT } from '../../actions/accounts'

describe('keys reducer', () => {
  const key = {
    id: 'keyId',
    expiration: 0,
    data: 'hello',
  }

  it('should return the initial state', () => {
    expect.assertions(1)
    expect(reducer(undefined, {})).toEqual({})
  })

  it('should return the initial state when receveing SET_PROVIDER', () => {
    expect.assertions(1)
    expect(
      reducer(
        {
          [key.id]: key,
        },
        {
          type: SET_PROVIDER,
        }
      )
    ).toBe(initialState)
  })

  it('should return the initial state when receveing SET_NETWORK', () => {
    expect.assertions(1)
    expect(
      reducer(
        {
          [key.id]: key,
        },
        {
          type: SET_NETWORK,
        }
      )
    ).toBe(initialState)
  })

  // Upon changing account, we need to clear the existing keys. The web3 middleware will
  // re-populate them
  it('should clear the keys when receiving SET_ACCOUNT', () => {
    expect.assertions(1)
    const account = {}
    const state = {
      [key.id]: key,
    }
    expect(
      reducer(state, {
        type: SET_ACCOUNT,
        account,
      })
    ).toBe(initialState)
  })

  describe('SET_KEY', () => {
    it('should refuse to add a key with the wrong id and keep state intact', () => {
      expect.assertions(1)
      const id = '0x123'

      const state = {}
      const action = {
        type: SET_KEY,
        id,
        key: {
          id: '0x456',
          data: 'new key',
        },
      }

      expect(reducer(state, action)).toEqual(state)
    })

    it('should add the key by its id accordingly when receiving SET_KEY', () => {
      expect.assertions(1)

      const id = '0x123'
      const key = {
        data: 'data',
        expiration: 100,
      }
      expect(
        reducer(
          {},
          {
            type: SET_KEY,
            id,
            key,
          }
        )
      ).toEqual({
        [id]: {
          id,
          data: 'data',
          expiration: 100,
        },
      })
    })

    it('should update the keys values', () => {
      expect.assertions(1)
      const key = {
        id: 'keyId',
        expiration: 1,
        data: 'hello',
      }
      const state = {
        [key.id]: key,
      }

      const action = {
        type: SET_KEY,
        id: key.id,
        key: {
          data: 'world',
        },
      }
      expect(reducer(state, action)).toEqual({
        [key.id]: {
          data: 'world',
          id: 'keyId',
          expiration: 1,
        },
      })
    })
  })

  describe('PURCHASE_KEY', () => {
    it('should add a key when receiving PURCHASE_KEY if the key has an id', () => {
      expect.assertions(1)

      expect(
        reducer(
          {},
          {
            type: PURCHASE_KEY,
            key,
          }
        )
      ).toEqual({
        [key.id]: key,
      })
    })

    it('should add a key when receiving PURCHASE_KEY and construct a key id if needed', () => {
      expect.assertions(1)

      const newKey = {
        lock: '0x123',
        owner: '0x456',
      }
      expect(
        reducer(
          {},
          {
            type: PURCHASE_KEY,
            key: newKey,
          }
        )
      ).toEqual({
        '0x123-0x456': {
          id: '0x123-0x456',
          lock: '0x123',
          owner: '0x456',
        },
      })
    })
  })
})
