import reducer, { initialState } from '../../reducers/userDetails'

import { SET_ENCRYPTED_PRIVATE_KEY } from '../../actions/user'

import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'
import { SET_ACCOUNT } from '../../actions/accounts'

const oldKeyState = {
  key: {
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
        salt:
          '4531b3c174cc3ff32a6a7a85d6761b410db674807b2d216d022318ceee50be10',
        n: 262144,
        r: 8,
        p: 1,
      },
      mac: 'b8b010fff37f9ae5559a352a185e86f9b9c1d7f7a9f1bd4e82a5dd35468fc7f6',
    },
  },
  email: 'bees@bzzzzzzzzzz.sting',
}

const newKeyState = {
  key: {
    version: 3,
    id: 'different than the other one',
    address: '2c7536e3605d9c16a7a3d7b1898e529396a65c23',
    crypto: {
      ciphertext:
        'a1c25da3ecde4e6a24f3697251dd15d6208520efc84ad97397e906e6df24d251',
      cipherparams: { iv: '2885df2b63f7ef247d753c82fa20038a' },
      cipher: 'ROT13',
      kdf: 'scrypt',
      kdfparams: {
        dklen: 32,
        salt:
          '4531b3c174cc3ff32a6a7a85d6761b410db674807b2d216d022318ceee50be10',
        n: 262144,
        r: 8,
        p: 1,
      },
      mac: 'b8b010fff37f9ae5559a352a185e86f9b9c1d7f7a9f1bd4e82a5dd35468fc7f6',
    },
  },
  email: 'angrybees@BZZZZZZZZZZZZZ.STING',
}

describe('userDetailsReducer', () => {
  it.each([SET_ACCOUNT, SET_PROVIDER, SET_NETWORK])(
    'should retain state when receiving %s',
    (actionType) => {
      expect.assertions(1)
      const action = { type: actionType }
      expect(reducer(oldKeyState, action)).toEqual(oldKeyState)
    }
  )

  it('should set the key when receiving SET_ENCRYPTED_PRIVATE_KEY', () => {
    expect.assertions(2)
    const action = {
      type: SET_ENCRYPTED_PRIVATE_KEY,
      key: newKeyState.key,
      emailAddress: 'angrybees@BZZZZZZZZZZZZZ.STING',
    }
    expect(reducer(initialState, action)).toEqual(newKeyState)
    expect(reducer(oldKeyState, action)).toEqual(newKeyState)
  })
})
