import v8 from '../../v8'

import Web3Service from '../../web3Service'
import { getTestLockContract } from '../helpers/contracts'
import { getTestProvider } from '../helpers/provider'

const provider = getTestProvider({})

const lockAddress = '0xc43efe2c7116cb94d563b5a9d68f260ccc44256f'
const manager = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'

const lockContract = getTestLockContract({
  lockAddress,
  abi: v8.PublicLock.abi,
  provider,
})

let web3Service

describe('v8', () => {
  describe('isLockManager', () => {
    beforeEach(() => {
      web3Service = new Web3Service({
        readOnlyProvider: '',
        network: 1984,
      })

      web3Service.lockContractAbiVersion = jest.fn(() => Promise.resolve(v8))
      web3Service.getLockContract = jest.fn(() => Promise.resolve(lockContract))
    })

    it('should return true if the user is a manager', async () => {
      expect.assertions(2)
      lockContract.isLockManager = jest.fn(() => {
        return true
      })

      const isLockManager = await web3Service.isLockManager(
        lockAddress,
        manager
      )
      expect(isLockManager).toBe(true)
      expect(lockContract.isLockManager).toHaveBeenCalledWith(manager)
    })

    it('should return false if the user is not a manager', async () => {
      expect.assertions(1)
      lockContract.isLockManager = jest.fn(() => {
        return false
      })

      const isLockManager = await web3Service.isLockManager(
        lockAddress,
        '0xSomeoneElse'
      )
      expect(isLockManager).toBe(false)
    })
  })
})
