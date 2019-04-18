export const LOGIN_CREDENTIALS = 'login/GOT_CREDENTIALS'
export const LOGIN_SUCCEEDED = 'login/SUCCESS'
export const LOGIN_FAILED = 'login/FAILED'

interface Credentials {
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
export const loginFailed = (reason: string) => ({
  type: LOGIN_FAILED,
  reason,
})
