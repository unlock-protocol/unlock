import {
  LOGIN_CREDENTIALS,
  LOGIN_SUCCEEDED,
  LOGIN_FAILED,
  SIGNUP_CREDENTIALS,
  SIGNUP_EMAIL,
  SIGNUP_FAILED,
  SIGNUP_SUCCEEDED,
  loginCredentials,
  loginSucceeded,
  loginFailed,
  signupCredentials,
  signupEmail,
  signupFailed,
  signupSucceeded,
  CHANGE_PASSWORD,
  changePassword,
  GOT_PASSWORD,
  gotPassword,
} from '../../actions/user'

describe('user account actions', () => {
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

      expect(loginCredentials({ emailAddress, password })).toEqual(
        expectedAction
      )
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

  describe('signup actions', () => {
    it('should create an action indicating an email has been submitted', () => {
      expect.assertions(1)
      const emailAddress = 'ray@smuckles.escalade'
      const expectedAction = {
        type: SIGNUP_EMAIL,
        emailAddress,
      }

      expect(signupEmail(emailAddress)).toEqual(expectedAction)
    })

    it('should create an action indicating a bundle of credentials has been submitted', () => {
      expect.assertions(1)
      const password = 'entropy9'
      const emailAddress = 'ray@smuckles.escalade'
      const expectedAction = {
        type: SIGNUP_CREDENTIALS,
        password,
        emailAddress,
      }

      expect(signupCredentials({ password, emailAddress })).toEqual(
        expectedAction
      )
    })

    it('should create an action indicating a signup has failed', () => {
      expect.assertions(1)
      const reason = 'The email is already in use.'
      const expectedAction = {
        type: SIGNUP_FAILED,
        reason,
      }

      expect(signupFailed(reason)).toEqual(expectedAction)
    })

    it('should create an action indicating a signup has succeeded', () => {
      expect.assertions(1)
      const expectedAction = {
        type: SIGNUP_SUCCEEDED,
      }

      expect(signupSucceeded()).toEqual(expectedAction)
    })
  })

  describe('user account maintenance actions', () => {
    it('should create an action indicating a password change', () => {
      expect.assertions(1)
      // Much more secure now
      const newPassword = 'gUeSt1337'
      const expectedAction = {
        type: CHANGE_PASSWORD,
        newPassword,
      }

      expect(changePassword(newPassword)).toEqual(expectedAction)
    })
  })

  describe('user authentication actions', () => {
    it('should create an action to deliver a requested password', () => {
      expect.assertions(1)
      const password = 'guest'
      const expectedAction = {
        type: GOT_PASSWORD,
        password,
      }

      expect(gotPassword(password)).toEqual(expectedAction)
    })
  })
})
