import { WalletService } from '@unlock-protocol/unlock-js'
import { utils } from 'ethers'
import UnlockProvider from '../../services/unlockProvider'

// These tests are slow because we generate private keys
jest.setTimeout(15000)

const utf8ToHex = (str) =>
  utils.hexlify(str.length ? utils.toUtf8Bytes(str) : 0)

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
    const providerUrl = process.env.CI
      ? 'http://eth-node:8545'
      : 'http://127.0.0.1:8545'
    const requiredNetworkId = 1492

    provider = new UnlockProvider({ provider: providerUrl, requiredNetworkId })
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
      it('should sign an object with all fields passed', async () => {
        expect.assertions(1)
        const input = {
          emailAddress,
          publicKey,
          passwordEncryptedPrivateKey: key,
        }

        const { data, signature } = await provider.signUserData(input)
        const { domain, types, message, messageKey } = data
        // sigutil seems to downcase things

        expect(
          utils.verifyTypedData(domain, types, message[messageKey], signature)
        ).toEqual(utils.getAddress(publicKey))
      })

      it('should also sign an object with default values when not everything is passed', async () => {
        expect.assertions(1)
        const input = {}

        const { data, signature } = await provider.signUserData(input)
        const { domain, types, message, messageKey } = data
        // sigutil seems to downcase things
        expect(
          utils.verifyTypedData(domain, types, message[messageKey], signature)
        ).toEqual(utils.getAddress(publicKey))
      })
    })

    describe('signPaymentData', () => {
      it('should sign a stripe card token', async () => {
        expect.assertions(1)
        const token = 'tok_1EPsocIsiZS2oQBMRXzw21xh'
        const { data, signature } = await provider.signPaymentData(token)
        const { domain, types, message, messageKey } = data

        expect(
          utils.verifyTypedData(domain, types, message[messageKey], signature)
        ).toEqual(utils.getAddress(publicKey))
      })
    })

    describe('signKeyPurchaseRequestData', () => {
      it('should sign a key purchase request with a valid expiration time', async () => {
        expect.assertions(2)
        const input = {
          recipient: publicKey,
          lock: '0xaC6b4470B0cba92b823aB96762972e67a1C851d5',
        }
        const { data, signature } = await provider.signKeyPurchaseRequestData(
          input
        )
        const currentTime = Math.floor(Date.now() / 1000)

        const { domain, types, message, messageKey } = data
        expect(
          utils.verifyTypedData(domain, types, message[messageKey], signature)
        ).toEqual(utils.getAddress(publicKey))
        // Expiration must be some amount of time after right now
        expect(data.message.purchaseRequest.expiry > currentTime).toBeTruthy()
      })
    })

    describe('personal_sign', () => {
      it('should sign some hex data with the user account private key', async () => {
        expect.assertions(1)
        const someData = 'this is the data I want to sign'
        const messageHash = utf8ToHex(someData)

        // second param is unused, but in keeping with what we receive from WalletService
        const sig = await provider.personal_sign([messageHash, ''])

        expect(utils.verifyMessage(utils.arrayify(messageHash), sig)).toEqual(
          utils.getAddress(publicKey)
        )
      })

      it.skip('should be compatible with walletService', async (done) => {
        expect.assertions(1)

        const ws = new WalletService()
        ws.setUnlockAddress('0x885EF47c3439ADE0CB9b33a4D3c534C99964Db93')

        await ws.connect(provider)
        ws.signDataPersonal('account', 'this is my data', (error) => {
          expect(error).toBeNull()
          done()
        })
      })
    })

    describe('generateEjectionRequest', () => {
      it('should return a signed ejection request for the current account', async () => {
        expect.assertions(1)

        const { data, signature } =
          await provider.generateSignedEjectionRequest()

        const { domain, types, message, messageKey } = data
        expect(
          utils.verifyTypedData(domain, types, message[messageKey], signature)
        ).toEqual(utils.getAddress(publicKey))
      })
    })
  })

  describe('implemented JSON-RPC calls', () => {
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
