export const GOT_EMAIL = 'authentication/GOT_EMAIL'
export const GOT_PASSWORD = 'authentication/GOT_PASSWORD'
export const GOT_CREDENTIALS = 'authentication/GOT_CREDENTIALS'
export const AUTHENTICATION_FAILED = 'authentication/FAILED'

export const gotEmail = (emailAddress) => ({
  type: GOT_EMAIL,
  emailAddress,
})

export const gotPassword = (password) => ({
  type: GOT_PASSWORD,
  password,
})

export const gotCredentials = ({ emailAddress, password }) => ({
  type: GOT_CREDENTIALS,
  emailAddress,
  password,
})

// Should be triggered when the given password can't decrypt the
// password-encrypted-private-key associated with the given email. We don't need
// an action for success, because that will be implicit when SET_ACCOUNT is
// triggered.
export const authenticationFailed = (reason) => ({
  type: AUTHENTICATION_FAILED,
  reason,
})
