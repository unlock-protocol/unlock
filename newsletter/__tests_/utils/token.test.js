import axios from 'axios'
import { saveEmail } from '../../utils/token'
import configure from '../../config'

const locks = ['0x123']
const email = 'julien@unlock-protocol.com'
const web3Provider = {}
const userAddress = '0xuser'
const signature = 'signature'
const wallet = {}

const config = configure()

describe('token', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    wallet.getAddress = jest.fn(() => Promise.resolve(userAddress))
    wallet.signMessage = jest.fn(() => Promise.resolve(signature))
    web3Provider.getSigner = jest.fn(() => wallet)
  })

  it('should ask the user to sign the payload', async () => {
    expect.assertions(3)

    await saveEmail(web3Provider, locks, email)
    expect(web3Provider.getSigner).toHaveBeenCalled()
    expect(wallet.getAddress).toHaveBeenCalled()
    expect(wallet.signMessage).toHaveBeenCalledWith(
      `{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"},{"name":"salt","type":"bytes32"}]},"domain":{"name":"Unlock","version":"1"},"primaryType":"UserMetaData","message":{"UserMetaData":{"owner":"${userAddress}","data":{"protected":{"email":"${email}"}}}}}`
    )
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
