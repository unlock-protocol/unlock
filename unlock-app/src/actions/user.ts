import { EncryptedPrivateKey } from '../unlockTypes'

export const LOGIN_CREDENTIALS = 'login/GOT_CREDENTIALS'
export const LOGIN_SUCCEEDED = 'login/SUCCESS'
export const LOGIN_FAILED = 'login/FAILED'
export const SIGNUP_EMAIL = 'signup/GOT_EMAIL'
export const SIGNUP_CREDENTIALS = 'signup/GOT_CREDENTIALS'
export const SIGNUP_FAILED = 'signup/FAILED'
export const SIGNUP_SUCCEEDED = 'signup/SUCCESS'
export const CHANGE_PASSWORD = 'password/CHANGE'
export const GOT_PASSWORD = 'userCredentials/PASSWORD'
export const SET_ENCRYPTED_PRIVATE_KEY =
  'userCredentials/SET_ENCRYPTED_PRIVATE_KEY'
export const GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD =
  'userCredentials/GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD'
export const SIGN_USER_DATA = 'userCredentials/SIGN_USER_DATA'
export const SIGNED_USER_DATA = 'userCredentials/SIGNED_USER_DATA'
export const SIGN_PAYMENT_DATA = 'userCredentials/SIGN_PAYMENT_DATA'
export const SIGNED_PAYMENT_DATA = 'userCredentials/SIGNED_PAYMENT_DATA'
export const SIGN_PURCHASE_DATA = 'userCredentials/SIGN_PURCHASE_DATA'
export const SIGNED_PURCHASE_DATA = 'userCredentials/SIGNED_PURCHASE_DATA'
export const GET_STORED_PAYMENT_DETAILS = 'userAccount/GET_PAYMENT_DETAILS'

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

export const changePassword = (oldPassword: string, newPassword: string) => ({
  type: CHANGE_PASSWORD,
  oldPassword,
  newPassword,
})

export const gotPassword = (password: string) => ({
  type: GOT_PASSWORD,
  password,
})

// This should be dispatched along with setAccount in the storage middleware
// when a user logs in. This provides a bit of a timing concern, since
// SET_ACCOUNT usually wipes out all the state. So SET_ACCOUNT must be sent
// first.
export const setEncryptedPrivateKey = (
  key: EncryptedPrivateKey,
  emailAddress: string
) => ({
  type: SET_ENCRYPTED_PRIVATE_KEY,
  key,
  emailAddress,
})

export const gotEncryptedPrivateKeyPayload = (
  key: EncryptedPrivateKey,
  emailAddress: string,
  password: string
) => ({
  type: GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD,
  key,
  emailAddress,
  password,
})

interface UserData {
  emailAddress?: string
  publicKey?: string
  passwordEncryptedPrivateKey?: EncryptedPrivateKey
}
export const signUserData = (data: UserData) => ({
  type: SIGN_USER_DATA,
  data,
})

interface SignedUserData {
  data: {
    message: {
      emailAddress: string
      publicKey: string
      passwordEncryptedPrivateKey: EncryptedPrivateKey
    }
  }
  sig: any
}
export const signedUserData = ({ data, sig }: SignedUserData) => ({
  type: SIGNED_USER_DATA,
  data,
  sig,
})

export const signPaymentData = (stripeTokenId: string) => ({
  type: SIGN_PAYMENT_DATA,
  stripeTokenId,
})

interface SignedPaymentData {
  data: {
    message: {
      emailAddress: string
      publicKey: string
      stripeTokenId: string
    }
  }
  sig: any
}
export const signedPaymentData = ({ data, sig }: SignedPaymentData) => ({
  type: SIGNED_PAYMENT_DATA,
  data,
  sig,
})

export const getStoredPaymentDetails = (emailAddress: string) => ({
  type: GET_STORED_PAYMENT_DETAILS,
  emailAddress,
})

interface PurchaseData {
  recipient: string
  lock: string
}

export const signPurchaseData = (data: PurchaseData) => ({
  type: SIGN_PURCHASE_DATA,
  data,
})

interface SignedPurchaseData {
  data: {
    message: {
      purchaseRequest: {
        recipient: string
        lock: string
        expiry: number
      }
    }
  }
  sig: any
}

export const signedPurchaseData = ({ data, sig }: SignedPurchaseData) => ({
  type: SIGNED_PURCHASE_DATA,
  data,
  sig,
})
