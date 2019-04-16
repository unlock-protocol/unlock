import * as UnlockV0 from 'unlock-abi-0'
import Web3Service from '../../web3Service'
import _getKeyByLockForOwner from '../../v0/_getKeyByLockForOwner'
import NockHelper from '../helpers/nockHelper'

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, true /** debug */)
let unlockAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'

let web3Service
const blockTime = 3
const readOnlyProvider = 'http://127.0.0.1:8545'
const requiredConfirmations = 12

const lockAddress = '0xc43efe2c7116cb94d563b5a9d68f260ccc44256f'
const account = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'

describe('v01', () => {
  beforeEach(() => {
    nock.cleanAll()
    web3Service = new Web3Service({
      readOnlyProvider,
      unlockAddress,
      blockTime,
      requiredConfirmations,
    })
    web3Service._getKeyByLockForOwner = _getKeyByLockForOwner.bind(web3Service)
  })

  describe('_getKeyByLockForOwner', () => {
    it('should update the data and expiration date', async () => {
      expect.assertions(2)
      nock.ethCallAndYield(
        '0xabdf82ce00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1',
        lockAddress,
        '0x000000000000000000000000000000000000000000000000000000005b58fa05'
      )
      nock.ethCallAndYield(
        '0xd44fa14a00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1',
        lockAddress,
        '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000'
      )

      const lockContract = new web3Service.web3.eth.Contract(
        UnlockV0.PublicLock.abi,
        lockAddress
      )

      let [expiration, data] = await web3Service._getKeyByLockForOwner(
        lockContract,
        account
      )
      expect(expiration).toBe(1532557829)
      expect(data).toBe(null)
    })

    it('should handle missing key when the lock exists', async () => {
      expect.assertions(2)

      nock.ethCallAndFail(
        '0xabdf82ce00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1',
        lockAddress,
        { message: 'VM Exception while processing transaction: revert' }
      )
      nock.ethCallAndFail(
        '0xd44fa14a00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1',
        lockAddress,
        { message: 'VM Exception while processing transaction: revert' }
      )

      const lockContract = new web3Service.web3.eth.Contract(
        UnlockV0.PublicLock.abi,
        lockAddress
      )

      let [expiration, data] = await web3Service._getKeyByLockForOwner(
        lockContract,
        account
      )
      expect(expiration).toBe(0)
      expect(data).toBe(null)
    })
  })
})
