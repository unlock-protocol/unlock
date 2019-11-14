import { SET_ACCOUNT } from '../../actions/accounts'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'
import reducer, { initialState, Datum } from '../../reducers/metadataReducer'
import { gotBulkMetadata } from '../../actions/keyMetadata'

const lockAddress = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
const userAddress = '0xd4bb4b501ac12f35db35d60c845c8625b5f28fd1'

const metadata: Datum[] = [
  {
    userAddress,
    data: {
      userMetadata: {
        public: {
          color: 'blue',
        },
      },
    },
  },
]

describe('metadataReducer', () => {
  it('should return the initial state when receiving SET_PROVIDER', () => {
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

  it('should return the initial state when receiving SET_ACCOUNT', () => {
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

  it('should return the initial state when receiving SET_NETWORK', () => {
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
    const result = reducer(undefined, gotBulkMetadata(lockAddress, metadata))

    expect(result).toEqual({
      [lockAddress.toLowerCase()]: {
        [userAddress]: {
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
      [lockAddress.toLowerCase()]: {
        '0x123': {
          protected: {
            color: 'red',
          },
        },
      },
    }

    const result = reducer(initialState, gotBulkMetadata(lockAddress, metadata))

    expect(result).toEqual({
      [lockAddress.toLowerCase()]: {
        '0x123': {
          protected: {
            color: 'red',
          },
        },
        [userAddress.toLowerCase()]: {
          public: {
            color: 'blue',
          },
        },
      },
    })
  })
})
