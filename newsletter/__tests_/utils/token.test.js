import axios from 'axios'
import { advanceTo } from 'jest-date-mock'
import { saveEmail, getEmail } from '../../utils/token'
import configure from '../../config'

const locks = ['0x123']
const email = 'julien@unlock-protocol.com'
const web3Provider = {}
const userAddress = '0xuser'
const signature = 'signature'
const wallet = {}

const config = configure()
// Stopping time!
advanceTo(1337)

describe('token', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    wallet.getAddress = jest.fn(() => Promise.resolve(userAddress))
    web3Provider.send = jest.fn(() => Promise.resolve(signature))
    web3Provider.getSigner = jest.fn(() => wallet)
  })

  describe('saveEmail', () => {
    it('should ask the user to sign the payload', async () => {
      expect.assertions(3)

      await saveEmail(web3Provider, locks, email)
      expect(web3Provider.getSigner).toHaveBeenCalled()
      expect(wallet.getAddress).toHaveBeenCalled()

      expect(web3Provider.send).toHaveBeenCalledWith('personal_sign', [
        '0x7b227479706573223a7b22454950373132446f6d61696e223a5b7b226e616d65223a226e616d65222c2274797065223a22737472696e67227d2c7b226e616d65223a2276657273696f6e222c2274797065223a22737472696e67227d2c7b226e616d65223a22636861696e4964222c2274797065223a2275696e74323536227d2c7b226e616d65223a22766572696679696e67436f6e7472616374222c2274797065223a2261646472657373227d2c7b226e616d65223a2273616c74222c2274797065223a2262797465733332227d5d7d2c22646f6d61696e223a7b226e616d65223a22556e6c6f636b222c2276657273696f6e223a2231227d2c227072696d61727954797065223a22557365724d65746144617461222c226d657373616765223a7b22557365724d65746144617461223a7b226f776e6572223a22307875736572222c2264617461223a7b2270726f746563746564223a7b22656d61696c223a226a756c69656e40756e6c6f636b2d70726f746f636f6c2e636f6d227d7d7d7d7d',
        userAddress,
      ])
    })

    it('should store the token info', async () => {
      expect.assertions(1)
      await saveEmail(web3Provider, locks, email)
      expect(axios.put).toHaveBeenCalledWith(
        `${config.locksmithUri}/api/key/${locks[0]}/user/${userAddress}`,
        '{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"},{"name":"salt","type":"bytes32"}]},"domain":{"name":"Unlock","version":"1"},"primaryType":"UserMetaData","message":{"UserMetaData":{"owner":"0xuser","data":{"protected":{"email":"julien@unlock-protocol.com"}}}}}',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer-Simple ${btoa(signature)}`,
            'content-type': 'application/json',
          }),
        })
      )
    })

    it('should return true if all metadata could be saved', async () => {
      expect.assertions(1)
      const saved = await saveEmail(web3Provider, locks, email)
      expect(saved).toBe(true)
    })
  })

  describe('getEmail', () => {
    it('should ask the user to save the request', async () => {
      expect.assertions(3)

      await getEmail(web3Provider, locks[0])
      expect(web3Provider.getSigner).toHaveBeenCalled()
      expect(wallet.getAddress).toHaveBeenCalled()

      expect(web3Provider.send).toHaveBeenCalledWith('personal_sign', [
        '0x7b227479706573223a7b22454950373132446f6d61696e223a5b7b226e616d65223a226e616d65222c2274797065223a22737472696e67227d2c7b226e616d65223a2276657273696f6e222c2274797065223a22737472696e67227d2c7b226e616d65223a22636861696e4964222c2274797065223a2275696e74323536227d2c7b226e616d65223a22766572696679696e67436f6e7472616374222c2274797065223a2261646472657373227d2c7b226e616d65223a2273616c74222c2274797065223a2262797465733332227d5d2c224b65794d65746164617461223a5b5d7d2c22646f6d61696e223a7b226e616d65223a22556e6c6f636b222c2276657273696f6e223a2231227d2c227072696d61727954797065223a224b65794d65746164617461222c226d657373616765223a7b22557365724d65746144617461223a7b226f776e6572223a22307875736572222c2274696d657374616d70223a313333377d7d7d',
        userAddress,
      ])
    })

    it('should send a request to get the token data and yield the email', async () => {
      expect.assertions(2)
      const response = {
        data: {
          userMetadata: {
            protected: {
              email: 'hello@unlock-protocol.com',
            },
          },
        },
      }
      axios.get = jest.fn(() => response)

      const email = await getEmail(web3Provider, locks[0])
      expect(axios.get).toHaveBeenCalledWith(
        `${config.locksmithUri}/api/key/${locks[0]}/user/${userAddress}?`,
        expect.objectContaining({
          params: {
            data:
              '{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"},{"name":"salt","type":"bytes32"}],"KeyMetadata":[]},"domain":{"name":"Unlock","version":"1"},"primaryType":"KeyMetadata","message":{"UserMetaData":{"owner":"0xuser","timestamp":1337}}}',
          },
          headers: expect.objectContaining({
            Authorization: `Bearer-Simple ${btoa(signature)}`,
            'content-type': 'application/json',
          }),
        })
      )

      expect(email).toEqual('hello@unlock-protocol.com')
    })
  })
})
