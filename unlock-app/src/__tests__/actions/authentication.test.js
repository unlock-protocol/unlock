import * as auth from '../../actions/authentication'

describe('authentication actions', () => {
  it('should create an action to signal receipt of an email', () => {
    expect.assertions(1)
    const email = 'geoff@bitconnect.gov'
    const expectedAction = {
      type: auth.GOT_EMAIL,
      emailAddress: email,
    }

    expect(auth.gotEmail(email)).toEqual(expectedAction)
  })

  it('should create an action to signal receipt of a password', () => {
    expect.assertions(1)
    const password = 'guest'
    const expectedAction = {
      type: auth.GOT_PASSWORD,
      password,
    }

    expect(auth.gotPassword(password)).toEqual(expectedAction)
  })

  it('should create an action to signal receipt of both credentials', () => {
    expect.assertions(1)
    const password = 'guest'
    const emailAddress = 'geoff@bitconnect.gov'
    const expectedAction = {
      type: auth.GOT_CREDENTIALS,
      emailAddress,
      password,
    }

    expect(auth.gotCredentials({ emailAddress, password })).toEqual(
      expectedAction
    )
  })

  it('should create an action to signal when authentication fails', () => {
    expect.assertions(1)
    const reason = 'Could not decrypt private key.'
    const expectedAction = {
      type: auth.AUTHENTICATION_FAILED,
      reason,
    }

    expect(auth.authenticationFailed(reason)).toEqual(expectedAction)
  })
})
