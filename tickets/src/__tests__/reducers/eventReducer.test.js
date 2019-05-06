import reducer, { initialState } from '../../reducers/eventReducer'
import { UPDATE_EVENT } from '../../actions/event'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'
import { SET_ACCOUNT } from '../../actions/accounts'

describe('events reducer', () => {
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
    expect(reducer({ name: 'the party' }, { type })).toBe(initialState)
  })

  it('should add an event to the state', () => {
    expect.assertions(1)
    const event = {
      name: 'I am a dummy event',
    }
    expect(
      reducer(
        {},
        {
          type: UPDATE_EVENT,
          event,
        }
      )
    ).toEqual(event)
  })
})
