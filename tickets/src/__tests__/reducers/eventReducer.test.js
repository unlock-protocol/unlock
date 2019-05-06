import reducer from '../../reducers/eventReducer'
import { UPDATE_EVENT } from '../../actions/event'

describe('events reducer', () => {
  it('should return the initial state', () => {
    expect.assertions(1)
    expect(reducer(undefined, {})).toEqual({})
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
