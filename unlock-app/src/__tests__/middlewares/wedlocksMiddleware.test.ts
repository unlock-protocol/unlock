import axios from 'axios'
import wedlocksMiddleware from '../../middlewares/wedlocksMiddleware'
import {
  SIGNUP_EMAIL,
  SIGNUP_CREDENTIALS,
  CREATE_USER,
} from '../../actions/signUp'

jest.mock('axios')

const config = {
  services: {
    wedlocks: {
      host: 'gopher://gopher.unlock-protocol.fake',
    },
  },
}

let dispatch: any
let next: any

describe('Wedlocks Middleware', () => {
  beforeEach(() => {
    dispatch = jest.fn()
    next = jest.fn()
  })

  it('should send a confirmation email on receiving SIGNUP_EMAIL', () => {
    expect.assertions(1)
    wedlocksMiddleware(config)({ dispatch })(next)({
      type: SIGNUP_EMAIL,
      emailAddress: 'tim@cern.ch',
    })

    expect(axios.post).toHaveBeenCalled()
  })

  it('should dispatch a CREATE_USER after handling a SIGNUP_CREDENTIALS', () => {
    expect.assertions(1)
    wedlocksMiddleware(config)({ dispatch })(next)({
      type: SIGNUP_CREDENTIALS,
      emailAddress: 'tim@cern.ch',
      password: 'guest',
    })

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: CREATE_USER })
    )
  })
})
