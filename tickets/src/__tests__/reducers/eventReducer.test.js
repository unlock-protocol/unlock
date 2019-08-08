import reducer from '../../reducers/eventReducer'
import { UPDATE_EVENT, SAVED_EVENT } from '../../actions/event'

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

  it('should mark an event as saved', () => {
    expect.assertions(1)
    const event = {
      name: 'I am a dummy event',
    }
    expect(
      reducer(event, {
        type: SAVED_EVENT,
        event,
      }).saved
    ).toEqual(true)
  })
})
