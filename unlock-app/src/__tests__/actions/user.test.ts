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
  SET_ENCRYPTED_PRIVATE_KEY,
  setEncryptedPrivateKey,
  GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD,
  gotEncryptedPrivateKeyPayload,
  SIGN_USER_DATA,
  signUserData,
  SIGNED_USER_DATA,
  signedUserData,
  SIGN_PAYMENT_DATA,
  signPaymentData,
  SIGNED_PAYMENT_DATA,
  signedPaymentData,
  CONFIRM_KEY_PURCHASE,
  confirmKeyPurchase,
  GET_STORED_PAYMENT_DETAILS,
  getStoredPaymentDetails,
  SIGN_PURCHASE_DATA,
  signPurchaseData,
  SIGNED_PURCHASE_DATA,
  signedPurchaseData,
} from '../../actions/user'

const key = {
  version: 3,
  id: '04e9bcbb-96fa-497b-94d1-14df4cd20af6',
  address: '2c7536e3605d9c16a7a3d7b1898e529396a65c23',
  crypto: {
    ciphertext:
      'a1c25da3ecde4e6a24f3697251dd15d6208520efc84ad97397e906e6df24d251',
    cipherparams: { iv: '2885df2b63f7ef247d753c82fa20038a' },
    cipher: 'aes-128-ctr',
    kdf: 'scrypt',
    kdfparams: {
      dklen: 32,
      salt: '4531b3c174cc3ff32a6a7a85d6761b410db674807b2d216d022318ceee50be10',
      n: 262144,
      r: 8,
      p: 1,
    },
    mac: 'b8b010fff37f9ae5559a352a185e86f9b9c1d7f7a9f1bd4e82a5dd35468fc7f6',
  },
}
const emailAddress = 'ray@smuckles.escalade'
const password = 'entropy9'

describe('user account actions', () => {
  describe('login actions', () => {
    it('should create an action with credentials in tow', () => {
      expect.assertions(1)
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

    it("should create an action to set the user's encrypted key in the state", () => {
      expect.assertions(1)

      const expectedAction = {
        type: SET_ENCRYPTED_PRIVATE_KEY,
        key,
        emailAddress,
      }

      expect(setEncryptedPrivateKey(key, emailAddress)).toEqual(expectedAction)
    })

    it('should create an action to indicate that an account is ready to be decrypted', () => {
      expect.assertions(1)

      const expectedAction = {
        type: GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD,
        key,
        emailAddress,
        password,
      }

      expect(
        gotEncryptedPrivateKeyPayload(key, emailAddress, password)
      ).toEqual(expectedAction)
    })

    it('should create an action requesting stored payment details', () => {
      expect.assertions(1)

      const emailAddress = 'jenny@8675.309'
      const expectedAction = {
        type: GET_STORED_PAYMENT_DETAILS,
        emailAddress,
      }

      expect(getStoredPaymentDetails(emailAddress)).toEqual(expectedAction)
    })
  })

  describe('signup actions', () => {
    it('should create an action indicating an email has been submitted', () => {
      expect.assertions(1)
      const expectedAction = {
        type: SIGNUP_EMAIL,
        emailAddress,
      }

      expect(signupEmail(emailAddress)).toEqual(expectedAction)
    })

    it('should create an action indicating a bundle of credentials has been submitted', () => {
      expect.assertions(1)
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
      const oldPassword = 'guest'
      // Much more secure now
      const newPassword = 'gUeSt1337'
      const expectedAction = {
        type: CHANGE_PASSWORD,
        oldPassword,
        newPassword,
      }

      expect(changePassword(oldPassword, newPassword)).toEqual(expectedAction)
    })

    it('should create an action requesting the signature for a user structure', () => {
      expect.assertions(1)
      const data = {
        emailAddress: 'geoff@bitconnect.gov',
      }

      const expectedAction = {
        type: SIGN_USER_DATA,
        data,
      }

      expect(signUserData(data)).toEqual(expectedAction)
    })

    it('should create an action returning the signature for a user structure', () => {
      expect.assertions(1)
      const data = {
        message: {
          emailAddress,
          publicKey: '0x123abc',
          passwordEncryptedPrivateKey: key,
        },
      }
      const sig = {}

      const expectedAction = {
        type: SIGNED_USER_DATA,
        data,
        sig,
      }

      expect(signedUserData({ data, sig })).toEqual(expectedAction)
    })

    it('should create an action requesting the signature for a stripe token', () => {
      expect.assertions(1)
      const stripeTokenId = 'tok_1EPsocIsiZS2oQBMRXzw21xh'

      const expectedAction = {
        type: SIGN_PAYMENT_DATA,
        stripeTokenId,
      }

      expect(signPaymentData(stripeTokenId)).toEqual(expectedAction)
    })

    it('should create an action returning the signature for a stripe token', () => {
      expect.assertions(1)
      const data = {
        message: {
          emailAddress,
          publicKey: '0x123abc',
          stripeTokenId: 'tok_1EPsocIsiZS2oQBMRXzw21xh',
        },
      }
      const sig = {}

      const expectedAction = {
        type: SIGNED_PAYMENT_DATA,
        data,
        sig,
      }

      expect(signedPaymentData({ data, sig })).toEqual(expectedAction)
    })

    it('should create an action requesting the signature for a key purchase', () => {
      expect.assertions(1)
      const data = {
        recipient: '0x123abc',
        lock: '0x321bca',
      }

      const expectedAction = {
        type: SIGN_PURCHASE_DATA,
        data,
      }

      expect(signPurchaseData(data)).toEqual(expectedAction)
    })

    it('should create an action returning the signature for a key purchase', () => {
      expect.assertions(1)
      const data = {
        message: {
          purchaseRequest: {
            recipient: '0x123abc',
            lock: 'ox321bca',
            expiry: 60,
          },
        },
      }
      const sig = {}

      const expectedAction = {
        type: SIGNED_PURCHASE_DATA,
        data,
        sig,
      }

      expect(signedPurchaseData({ data, sig })).toEqual(expectedAction)
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

  describe('paywall interaction', () => {
    it('should create an action to confirm a key purchase request', () => {
      expect.assertions(1)
      const expectedAction = {
        type: CONFIRM_KEY_PURCHASE,
      }

      expect(confirmKeyPurchase()).toEqual(expectedAction)
    })
  })
})
