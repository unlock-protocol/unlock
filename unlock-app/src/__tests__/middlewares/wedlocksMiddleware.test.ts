import wedlocksMiddleware from '../../middlewares/wedlocksMiddleware'
import { SIGNUP_EMAIL, WELCOME_EMAIL } from '../../actions/user'

const wedlocksService = {
  welcomeEmail: jest.fn(),
  confirmEmail: jest.fn(),
}
jest.mock('../../services/wedlockService', () => () => wedlocksService)

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
    const emailAddress = 'tim@cern.ch'
    wedlocksMiddleware(config)({ dispatch })(next)({
      type: SIGNUP_EMAIL,
      emailAddress,
    })

    expect(wedlocksService.confirmEmail).toHaveBeenCalledWith(
      emailAddress,
      'http://localhost/signup'
    )
  })

  it('should send a confirmation email on receiving WELCOME_EMAIL', () => {
    expect.assertions(1)
    const emailAddress = 'tim@cern.ch'
    const recoveryKey = {}
    wedlocksMiddleware(config)({ dispatch })(next)({
      type: WELCOME_EMAIL,
      emailAddress,
      recoveryKey,
    })

    expect(wedlocksService.welcomeEmail).toHaveBeenCalledWith(
      emailAddress,
      `http://localhost/recover/?email=tim@cern.ch&recoveryKey=${encodeURIComponent(
        JSON.stringify(recoveryKey)
      )}`
    )
  })
})
