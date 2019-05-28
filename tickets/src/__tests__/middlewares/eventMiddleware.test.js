import eventMiddleware from '../../middlewares/eventMiddleware'
import { LOAD_EVENT, ADD_EVENT } from '../../actions/event'
import { SIGN_DATA } from '../../actions/signature'
import configure from '../../config'
import UnlockEvent from '../../structured_data/unlockEvent'

/**
 * This is a "fake" middleware caller
 * Taken from https://redux.js.org/recipes/writing-tests#middleware
 */

let router = {
  location: {
    pathname: '',
  },
}
let state = {}
let account = {
  address: '0xabc',
}

const create = () => {
  const config = configure()
  const store = {
    getState: jest.fn(() => state),
    dispatch: jest.fn(() => true),
  }
  const next = jest.fn()
  const handler = eventMiddleware(config)(store)
  const invoke = action => handler(next)(action)
  return { next, invoke, store }
}

let mockeventService = {}
jest.mock('../../services/eventService', () => {
  return function() {
    return mockeventService
  }
})

describe('Event middleware', () => {
  beforeEach(() => {
    state = {
      account,
      router,
    }
    // reset the mock
    mockeventService = {}
  })

  describe('handling ADD_EVENT', () => {
    it('should save an event from the provided object', async () => {
      expect.assertions(2)
      const { next, invoke, store } = create()

      const eventDate = new Date()

      const action = {
        type: ADD_EVENT,
        event: {
          name: 'Arbitrary name',
          date: eventDate,
          lockAddress: '0x123',
          description: 'Arbitrary description',
          location: 'My house',
          duration: 360,
          logo: 'Some string',
          image: 'Image hash',
          outOfSchemaField: 'What is this doing here?!',
        },
      }

      const data = UnlockEvent.build({
        name: 'Arbitrary name',
        date: eventDate,
        lockAddress: '0x123',
        description: 'Arbitrary description',
        location: 'My house',
        duration: 360,
        logo: 'Some string',
        image: 'Image URI',
      })

      await invoke(action)
      expect(store.dispatch).toHaveBeenCalledWith({
        type: SIGN_DATA,
        data,
      })
      expect(next).toHaveBeenCalledTimes(1)
    })
  })

  describe('handling LOAD_EVENT', () => {
    it('should load an event from address', async () => {
      expect.assertions(2)
      const { next, invoke } = create()
      const action = { type: LOAD_EVENT, address: '0x123' }
      mockeventService.getEvent = jest.fn(() => {
        return Promise.resolve()
      })

      await invoke(action)
      expect(mockeventService.getEvent).toHaveBeenCalledWith('0x123')
      expect(next).toHaveBeenCalledTimes(1)
    })
  })
})
