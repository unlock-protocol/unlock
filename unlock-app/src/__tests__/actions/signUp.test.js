import * as s from '../../actions/signUp'

describe('signup actions', () => {
  it('should create an action indicating an email has been submitted', () => {
    expect.assertions(1)
    const emailAddress = 'ray@smuckles.escalade'
    const expectedAction = {
      type: s.SIGNUP_EMAIL,
      emailAddress,
    }

    expect(s.signupEmail(emailAddress)).toEqual(expectedAction)
  })

  it('should create an action indicating a password has been submitted', () => {
    expect.assertions(1)
    const password = 'entropy9'
    const expectedAction = {
      type: s.SIGNUP_PASSWORD,
      password,
    }

    expect(s.signupPassword(password)).toEqual(expectedAction)
  })

  it('should create an action indicating a bundle of credentials has been submitted', () => {
    expect.assertions(1)
    const password = 'entropy9'
    const emailAddress = 'ray@smuckles.escalade'
    const expectedAction = {
      type: s.SIGNUP_CREDENTIALS,
      password,
      emailAddress,
    }

    expect(s.signupCredentials({ password, emailAddress })).toEqual(
      expectedAction
    )
  })

  it('should create an action indicating a signup has failed', () => {
    expect.assertions(1)
    const reason = 'The email is already in use.'
    const expectedAction = {
      type: s.SIGNUP_FAILED,
      reason,
    }

    expect(s.signupFailed(reason)).toEqual(expectedAction)
  })

  it('should create an action indicating a signup has succeeded', () => {
    expect.assertions(1)
    const expectedAction = {
      type: s.SIGNUP_SUCCEEDED,
    }

    expect(s.signupSucceeded()).toEqual(expectedAction)
  })

  it('should create an action indicating that a user account should be created', () => {
    expect.assertions(1)
    const user = {
      name: 'This is mock data',
    }
    const expectedAction = {
      type: s.CREATE_USER,
      user,
    }
    expect(s.createUser(user)).toEqual(expectedAction)
  })
})
