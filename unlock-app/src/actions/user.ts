export const LOGIN_CREDENTIALS = 'login/GOT_CREDENTIALS'
export const LOGIN_SUCCEEDED = 'login/SUCCESS'
export const LOGIN_FAILED = 'login/FAILED'
export const SIGNUP_EMAIL = 'signup/GOT_EMAIL'
export const SIGNUP_CREDENTIALS = 'signup/GOT_CREDENTIALS'
export const SIGNUP_FAILED = 'signup/FAILED'
export const SIGNUP_SUCCEEDED = 'signup/SUCCESS'
export const CHANGE_PASSWORD = 'password/CHANGE'

export interface Credentials {
  emailAddress: string
  password: string
}

export const loginCredentials = ({ emailAddress, password }: Credentials) => ({
  type: LOGIN_CREDENTIALS,
  emailAddress,
  password,
})

export const loginSucceeded = () => ({
  type: LOGIN_SUCCEEDED,
})

// TODO: determine possible reasons for login failure, maybe replace string with
// union type
// TODO: Just use a generic error condition?
export const loginFailed = (reason: string) => ({
  type: LOGIN_FAILED,
  reason,
})

export const signupEmail = (emailAddress: string) => ({
  type: SIGNUP_EMAIL,
  emailAddress,
})

export const signupCredentials = ({ emailAddress, password }: Credentials) => ({
  type: SIGNUP_CREDENTIALS,
  emailAddress,
  password,
})

// Should be triggered when signup fails for any reason (email already in use...)
export const signupFailed = (reason: string) => ({
  type: SIGNUP_FAILED,
  reason,
})

// TODO: Determine if this action requires a payload. Depends on exact way signup works.
export const signupSucceeded = () => ({
  type: SIGNUP_SUCCEEDED,
})

export const changePassword = (newPassword: string) => ({
  type: CHANGE_PASSWORD,
  newPassword,
})
