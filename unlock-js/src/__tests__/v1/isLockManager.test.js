import v1 from '../../v1'

import Web3Service from '../../web3Service'
import { getTestLockContract } from '../helpers/contracts'
import { getTestProvider } from '../helpers/provider'

const provider = getTestProvider({})

const lockAddress = '0xc43efe2c7116cb94d563b5a9d68f260ccc44256f'
const owner = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'

const lockContract = getTestLockContract({
  lockAddress,
  abi: v1.PublicLock.abi,
  provider,
})

let web3Service

describe('v1', () => {
  describe('isLockManager', () => {
    beforeEach(() => {
      web3Service = new Web3Service({
        readOnlyProvider: '',
        network: 1984,
      })

      web3Service.lockContractAbiVersion = jest.fn(() => Promise.resolve(v1))
      web3Service.getLockContract = jest.fn(() => Promise.resolve(lockContract))
      lockContract.owner = jest.fn(() => {
        return owner
      })
    })

    it('should return true if the user is the owner', async () => {
      expect.assertions(2)
      const isLockManager = await web3Service.isLockManager(lockAddress, owner)
      expect(isLockManager).toBe(true)
      expect(lockContract.owner).toHaveBeenCalledWith()
    })

    it('should return false if the user is not the owner', async () => {
      expect.assertions(1)
      const isLockManager = await web3Service.isLockManager(
        lockAddress,
        '0xSomeoneElse'
      )
      expect(isLockManager).toBe(false)
    })
  })
})
