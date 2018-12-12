import reducer from '../../reducers/keysReducer'
import { ADD_KEY, PURCHASE_KEY, UPDATE_KEY } from '../../actions/key'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'

describe('keys reducer', () => {
  const key = {
    id: 'keyId',
    expiration: 0,
    data: 'hello',
  }

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({})
  })

  it('should return the initial state when receveing SET_PROVIDER', () => {
    expect(
      reducer(
        {
          [key.id]: key,
        },
        {
          type: SET_PROVIDER,
        }
      )
    ).toEqual({})
  })

  it('should return the initial state when receveing SET_NETWORK', () => {
    expect(
      reducer(
        {
          [key.id]: key,
        },
        {
          type: SET_NETWORK,
        }
      )
    ).toEqual({})
  })

  describe('ADD_KEY', () => {
    it('should refuse to add a key with the wrong id', () => {
      const id = '0x123'

      const state = {}
      const action = {
        type: ADD_KEY,
        id,
        key: {
          id: '0x456',
          data: 'new key',
        },
      }

      expect(() => {
        reducer(state, action)
      }).toThrowError('Could not add key with wrong id')
    })

    it('should refuse to overwrite keys', () => {
      const id = '0x123'

      const state = {
        [id]: {
          data: 'previous key',
        },
      }
      const action = {
        type: ADD_KEY,
        id,
        key: {
          id,
          data: 'new key',
        },
      }

      expect(() => {
        reducer(state, action)
      }).toThrowError('Could not add already existing key')
    })

    it('should add the key by its id accordingly when receiving ADD_KEY', () => {
      const id = '0x123'
      const key = {
        data: 'data',
        expiration: 100,
      }
      expect(
        reducer(
          {},
          {
            type: ADD_KEY,
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
  })

  it('should add a ley when receiving PURCHASE_KEY', () => {
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

  describe('UPDATE_KEY', () => {
    it('should trigger an error if trying to update the key id', () => {
      const key = {
        id: 'keyId',
        expiration: 0,
        data: 'hello',
      }
      const state = {
        [key.id]: key,
      }

      const action = {
        type: UPDATE_KEY,
        id: key.id,
        update: {
          id: 'newKeyId',
        },
      }
      expect(() => {
        reducer(state, action)
      }).toThrowError('Could not change the key id')
    })

    it('should throw when the key being updated does not exist', () => {
      const key = {
        id: 'keyId',
        expiration: 0,
        data: 'hello',
      }
      const state = {
        [key.id]: key,
      }

      const action = {
        type: UPDATE_KEY,
        id: 'newKeyId',
        update: {
          data: 'world',
        },
      }
      expect(() => {
        reducer(state, action)
      }).toThrowError('Could not update missing key')
    })

    it('should update the keys values', () => {
      const key = {
        id: 'keyId',
        expiration: 0,
        data: 'hello',
      }
      const state = {
        [key.id]: key,
      }

      const action = {
        type: UPDATE_KEY,
        id: key.id,
        update: {
          data: 'world',
          expiration: '10',
        },
      }
      expect(reducer(state, action)).toEqual({
        [key.id]: {
          data: 'world',
          id: 'keyId',
          expiration: '10',
        },
      })
    })
  })
})
