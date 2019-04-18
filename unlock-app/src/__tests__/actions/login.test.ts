import {
  LOGIN_CREDENTIALS,
  LOGIN_SUCCEEDED,
  LOGIN_FAILED,
  loginCredentials,
  loginSucceeded,
  loginFailed,
} from '../../actions/login'

describe('login actions', () => {
  it('should create an action with credentials in tow', () => {
    expect.assertions(1)
    const emailAddress = 'vitalik@bagholde.rs'
    const password = 'guest'
    const expectedAction = {
      type: LOGIN_CREDENTIALS,
      emailAddress,
      password,
    }

    expect(loginCredentials({ emailAddress, password })).toEqual(expectedAction)
  })

  it('should create an action to indicate successful login', () => {
    expect.assertions(1)
    const expectedAction = {
      type: LOGIN_SUCCEEDED,
    }

    expect(loginSucceeded()).toEqual(expectedAction)
  })

  it('should create an action to indicate failed login', () => {
    expect.assertions(1)
    const reason = 'Incorrect secret Swiss account #'
    const expectedAction = {
      type: LOGIN_FAILED,
      reason,
    }

    expect(loginFailed(reason)).toEqual(expectedAction)
  })
})
