import v0 from '../../v0'
import Web3Service from '../../web3Service'
import utils from '../../utils'

import { getTestProvider } from '../helpers/provider'
import { getTestLockContract } from '../helpers/contracts'

let web3Service
const lockAddress = '0xc43efe2c7116cb94d563b5a9d68f260ccc44256f'
const owner = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'

const provider = getTestProvider({})

const lockContract = getTestLockContract({
  lockAddress,
  abi: v0.PublicLock.abi,
  provider,
})

describe('v0', () => {
  beforeEach(() => {
    web3Service = new Web3Service({
      readOnlyProvider: '',
      network: 1984,
    })
    web3Service.getLockContract = jest.fn(() => Promise.resolve(lockContract))

    web3Service.getAddressBalance = jest.fn(() => Promise.resolve('123'))

    web3Service.provider.getBlockNumber = jest.fn(() => Promise.resolve(1337))
    lockContract.functions = {
      'keyPrice()': jest.fn(() => utils.toWei('0.01', 'ether')),
      'expirationDuration()': jest.fn(() => Promise.resolve(2592000)),
      'maxNumberOfKeys()': jest.fn(() => Promise.resolve(10)),
      'owner()': jest.fn(() => Promise.resolve(owner)),
      'outstandingKeys()': jest.fn(() => Promise.resolve(17)),
    }
  })

  describe('getLock', () => {
    it('should get the lock contract based on its address', async () => {
      expect.assertions(1)
      await web3Service.getLock(lockAddress)
      expect(web3Service.getLockContract).toHaveBeenCalledWith(lockAddress)
    })

    it('should trigger an event when it has been loaded with an updated balance', async () => {
      expect.assertions(2)

      web3Service.on('lock.updated', (address, update) => {
        expect(address).toBe(lockAddress)
        expect(update).toMatchObject({
          balance: '123',
          keyPrice: utils.fromWei('10000000000000000', 'ether'),
          expirationDuration: 2592000,
          maxNumberOfKeys: 10,
          beneficiary: owner,
          outstandingKeys: 17,
          asOf: 1337,
          name: null,
        })
      })

      await web3Service.getLock(lockAddress)
    })

    it('should successfully yield a lock with an unlimited number of keys', async () => {
      expect.assertions(3)

      lockContract.functions['maxNumberOfKeys()'] = jest.fn(() =>
        Promise.resolve(-1)
      )

      web3Service.on('lock.updated', (address, update) => {
        expect(address).toBe(lockAddress)
        expect(update).toMatchObject({
          maxNumberOfKeys: -1,
        })
      })

      const lock = await web3Service.getLock(lockAddress)
      expect(lock).toEqual({
        asOf: 1337,
        balance: '123',
        expirationDuration: 2592000,
        keyPrice: '0.01',
        maxNumberOfKeys: -1,
        outstandingKeys: 17,
        beneficiary: owner,
        currencyContractAddress: null,
        name: null,
      })
    })
  })
})
