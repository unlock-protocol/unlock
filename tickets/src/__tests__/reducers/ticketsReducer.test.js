import reducer, { initialState } from '../../reducers/ticketsReducer'
import { GOT_SIGNED_ADDRESS } from '../../actions/ticket'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'
import { SET_ACCOUNT } from '../../actions/accounts'

describe('tickets reducer', () => {
  const address = '0x12345678'
  const signedAddress = 'ENCRYPTED'

  it('should return the initial state', () => {
    expect.assertions(1)
    expect(reducer(undefined, {})).toEqual({})
  })

  it.each([
    ['SET_PROVIDER', SET_PROVIDER],
    ['SET_NETWORK', SET_NETWORK],
    ['SET_ACCOUNT', SET_ACCOUNT],
  ])('should return the initial state when receiving %s', (name, type) => {
    expect.assertions(1)
    expect(reducer({ address: signedAddress }, { type })).toBe(initialState)
  })

  it('should add a signed address to the state', () => {
    expect.assertions(1)
    expect(
      reducer(
        {},
        {
          type: GOT_SIGNED_ADDRESS,
          address,
          signedAddress,
        }
      )
    ).toEqual({ [address]: signedAddress })
  })
})
