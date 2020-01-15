import sigUtil from 'eth-sig-util'
import { WalletService } from '@unlock-protocol/unlock-js'
import { utils } from 'ethers'
import UnlockProvider from '../../services/unlockProvider'

const utf8ToHex = str => utils.hexlify(str.length ? utils.toUtf8Bytes(str) : 0)

const key = {
  id: 'fb1280c0-d646-4e40-9550-7026b1be504a',
  address: '88a5c2d9919e46f883eb62f7b8dd9d0cc45bc290',
  Crypto: {
    kdfparams: {
      dklen: 32,
      p: 1,
      salt: 'bbfa53547e3e3bfcc9786a2cbef8504a5031d82734ecef02153e29daeed658fd',
      r: 8,
      n: 262144,
    },
    kdf: 'scrypt',
    ciphertext:
      '10adcc8bcaf49474c6710460e0dc974331f71ee4c7baa7314b4a23d25fd6c406',
    mac: '1cf53b5ae8d75f8c037b453e7c3c61b010225d916768a6b145adf5cf9cb3a703',
    cipher: 'aes-128-ctr',
    cipherparams: {
      iv: '1dcdf13e49cea706994ed38804f6d171',
    },
  },
  version: 3,
}
const publicKey = '0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290'
const password = 'foo'
const emailAddress = 'geoff@bitconnect.gov'

describe('Unlock Provider', () => {
  let provider
  beforeAll(async () => {
    const readOnlyProvider = process.env.CI
      ? 'http://ganache-integration::8545'
      : 'http://127.0.0.1:8545'
    const requiredNetworkId = 1492

    provider = new UnlockProvider({ readOnlyProvider, requiredNetworkId })
    await provider.connect({ key, password, emailAddress })
  })

  describe('object properties', () => {
    it('should have a property `isUnlock` that is set to `true`', () => {
      expect.assertions(1)
      expect(provider.isUnlock).toBeTruthy()
    })

    it('should have a property `wallet` that is set to an ethers wallet', () => {
      expect.assertions(1)
      expect(provider.wallet).toEqual(
        expect.objectContaining({
          address: publicKey,
        })
      )
    })

    it('should have a property `emailAddress` that is set to the provided email address', () => {
      expect.assertions(1)
      expect(provider.emailAddress).toEqual(emailAddress)
    })

    it('should have a property `passwordEncryptedPrivateKey` that is set to the provided key', () => {
      expect.assertions(1)
      expect(provider.passwordEncryptedPrivateKey).toEqual(key)
    })
  })

  describe('signing data', () => {
    describe('signUserData', () => {
      it('should sign an object with all fields passed', () => {
        expect.assertions(1)
        const input = {
          emailAddress,
          publicKey,
          passwordEncryptedPrivateKey: key,
        }

        const output = provider.signUserData(input)
        // sigutil seems to downcase things
        expect(sigUtil.recoverTypedSignature(output)).toEqual(
          publicKey.toLowerCase()
        )
      })

      it('should also sign an object with default values when not everything is passed', () => {
        expect.assertions(1)
        const input = {}

        const output = provider.signUserData(input)
        // sigutil seems to downcase things
        expect(sigUtil.recoverTypedSignature(output)).toEqual(
          publicKey.toLowerCase()
        )
      })
    })

    describe('signPaymentData', () => {
      it('should sign a stripe card token', () => {
        expect.assertions(1)
        const token = 'tok_1EPsocIsiZS2oQBMRXzw21xh'
        const output = provider.signPaymentData(token)

        expect(sigUtil.recoverTypedSignature(output)).toEqual(
          publicKey.toLowerCase()
        )
      })
    })

    describe('signKeyPurchaseRequestData', () => {
      it('should sign a key purchase request with a valid expiration time', () => {
        expect.assertions(2)
        const input = {
          recipient: publicKey,
          lock: '0xaC6b4470B0cba92b823aB96762972e67a1C851d5',
        }
        const output = provider.signKeyPurchaseRequestData(input)
        const currentTime = Math.floor(Date.now() / 1000)

        expect(sigUtil.recoverTypedSignature(output)).toEqual(
          publicKey.toLowerCase()
        )
        // Expiration must be some amount of time after right now
        expect(
          output.data.message.purchaseRequest.expiry > currentTime
        ).toBeTruthy()
      })
    })

    describe('personal_sign', () => {
      it('should sign some hex data with the user account private key', () => {
        expect.assertions(1)
        const someData = 'this is the data I want to sign'
        const messageHash = utf8ToHex(someData)

        // second param is unused, but in keeping with what we receive from WalletService
        const sig = provider.personal_sign([messageHash, ''])

        expect(
          sigUtil.recoverPersonalSignature({
            data: messageHash,
            sig,
          })
        ).toEqual(publicKey.toLowerCase())
      })

      it('should be compatible with walletService', async done => {
        expect.assertions(1)

        const ws = new WalletService({ unlockAddress: 'does not matter here' })
        await ws.connect(provider)
        ws.signDataPersonal('account', 'this is my data', error => {
          expect(error).toBeNull()
          done()
        })
      })
    })

    describe('generateEjectionRequest', () => {
      it('should return a signed ejection request for the current account', () => {
        expect.assertions(1)

        const signature = provider.generateSignedEjectionRequest()

        expect(sigUtil.recoverTypedSignature(signature)).toEqual(
          publicKey.toLowerCase()
        )
      })
    })
  })

  describe('implemented JSON-RPC calls', () => {
    it('should respond to eth_accounts with an array containing only `this.wallet.address` after being initialized', async () => {
      expect.assertions(2)
      const accounts = await provider.send('eth_accounts')
      expect(accounts).toHaveLength(1)
      expect(accounts[0]).toEqual(publicKey)
    })

    it('should respond to personal_sign by calling the defined method', async () => {
      expect.assertions(1)
      provider.personal_sign = jest.fn()
      await provider.send('personal_sign', ['some data', 'an address'])

      expect(provider.personal_sign).toHaveBeenCalledWith([
        'some data',
        'an address',
      ])
    })
  })
})
