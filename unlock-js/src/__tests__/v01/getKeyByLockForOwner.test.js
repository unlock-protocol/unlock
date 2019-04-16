import Web3Service from '../../web3Service'

import getKeyByLockForOwner from '../../v01/getKeyByLockForOwner'
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
    web3Service.getKeyByLockForOwner = getKeyByLockForOwner.bind(web3Service)
  })

  describe('getKeyByLockForOwner', () => {
    it('should trigger an event with the key', done => {
      expect.assertions(5)

      web3Service._getKeyByLockForOwner = jest.fn(() => {
        return new Promise(resolve => {
          return resolve([100, 'hello'])
        })
      })

      web3Service.on('key.updated', (keyId, update) => {
        expect(keyId).toBe([lockAddress, account].join('-'))
        expect(update.expiration).toBe(100)
        expect(update.data).toBe('hello')
        expect(update.lock).toBe(lockAddress)
        expect(update.owner).toBe(account)
        done()
      })
      web3Service.getKeyByLockForOwner(lockAddress, account)
    })
  })
})
