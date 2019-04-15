export const SIGNUP_EMAIL = 'signup/GOT_EMAIL'
export const SIGNUP_PASSWORD = 'signup/GOT_PASSWORD'
export const SIGNUP_CREDENTIALS = 'signup/GOT_CREDENTIALS'
export const SIGNUP_FAILED = 'signup/FAILED'
export const SIGNUP_SUCCEEDED = 'signup/SUCCESS'
export const CREATE_USER = 'signup/CREATE_USER'

export const signupEmail = emailAddress => ({
  type: SIGNUP_EMAIL,
  emailAddress,
})

export const signupPassword = password => ({
  type: SIGNUP_PASSWORD,
  password,
})

export const signupCredentials = ({ emailAddress, password }) => ({
  type: SIGNUP_CREDENTIALS,
  emailAddress,
  password,
})

// Should be triggered when signup fails for any reason (email already in use...)
export const signupFailed = reason => ({
  type: SIGNUP_FAILED,
  reason,
})

// TODO: Determine if this action requires a payload. Depends on exact way signup works.
export const signupSucceeded = () => ({
  type: SIGNUP_SUCCEEDED,
})

export const createUser = user => ({
  type: CREATE_USER,
  user,
})
