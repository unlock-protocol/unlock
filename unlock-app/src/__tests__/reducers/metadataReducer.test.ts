import { SET_ACCOUNT } from '../../actions/accounts'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'
import reducer, { initialState } from '../../reducers/metadataReducer'
import { GOT_METADATA } from '../../actions/keyMetadata'

describe('metadataReducer', () => {
  it('should return the initial state when receiveing SET_PROVIDER', () => {
    expect.assertions(1)
    const result = reducer(
      {
        'an address': {
          '1': {},
        },
      },
      { type: SET_PROVIDER }
    )
    expect(result).toBe(initialState)
  })

  it('should return the initial state when receiveing SET_ACCOUNT', () => {
    expect.assertions(1)
    const result = reducer(
      {
        'an address': {
          '1': {},
        },
      },
      { type: SET_ACCOUNT }
    )
    expect(result).toBe(initialState)
  })

  it('should return the initial state when receiveing SET_NETWORK', () => {
    expect.assertions(1)
    const result = reducer(
      {
        'an address': {
          '1': {},
        },
      },
      { type: SET_NETWORK }
    )
    expect(result).toBe(initialState)
  })

  it('returns initial state at first', () => {
    expect.assertions(1)
    const result = reducer(undefined, { type: 'an action' })

    expect(result).toBe(initialState)
  })

  it('adds a lock to the state with metadata', () => {
    expect.assertions(1)
    const result = reducer(undefined, {
      type: GOT_METADATA,
      lockAddress: 'my address',
      keyId: '7',
      data: {
        public: {
          color: 'blue',
        },
      },
    })

    expect(result).toEqual({
      'my address': {
        '7': {
          public: {
            color: 'blue',
          },
        },
      },
    })
  })

  it('should append data when a lock address is already present', () => {
    expect.assertions(1)
    const initialState = {
      'my address': {
        '7': {
          public: {
            color: 'blue',
          },
        },
      },
    }

    const result = reducer(initialState, {
      type: GOT_METADATA,
      lockAddress: 'my address',
      keyId: '8',
      data: {
        public: {
          emailAddress: 'in@ter.net',
        },
      },
    })

    expect(result).toEqual({
      'my address': {
        '7': {
          public: {
            color: 'blue',
          },
        },
        '8': {
          public: {
            emailAddress: 'in@ter.net',
          },
        },
      },
    })
  })
})
