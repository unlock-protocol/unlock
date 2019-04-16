/* eslint no-console: 0 */

import nock from 'nock'
import * as UnlockV0 from 'unlock-abi-0'
import * as UnlockV01 from 'unlock-abi-0-1'
import UnlockService, { Errors } from '../unlockService'
import v0 from '../v0'
import v01 from '../v01'

// This unlock address smart contract is fake
const unlockAddress = '0xc43efe2c7116cb94d563b5a9d68f260ccc44256f'

let unlockService

describe('UnlockService', () => {
  beforeEach(() => {
    nock.cleanAll()
    unlockService = new UnlockService({
      unlockAddress,
    })
    // We use a mock web3
    unlockService.web3 = {}
  })

  describe('unlockContractAbiVersion', () => {
    it('should return UnlockV0 when the opCode matches', async () => {
      expect.assertions(2)
      unlockService.web3.eth = {
        getCode: jest.fn(() => {
          return Promise.resolve(UnlockV0.Unlock.deployedBytecode)
        }),
      }
      const version = await unlockService.unlockContractAbiVersion()

      expect(unlockService.web3.eth.getCode).toHaveBeenCalledWith(unlockAddress)
      expect(version).toEqual(v0)
    })

    it('should return UnlockV01 when the opCode matches', async () => {
      expect.assertions(2)
      unlockService.web3.eth = {
        getCode: jest.fn(() => {
          return Promise.resolve(UnlockV01.Unlock.deployedBytecode)
        }),
      }
      const version = await unlockService.unlockContractAbiVersion()

      expect(unlockService.web3.eth.getCode).toHaveBeenCalledWith(unlockAddress)
      expect(version).toEqual(v01)
    })

    it('should throw NON_DEPLOYED_CONTRACT if the opCode is 0x', async () => {
      expect.assertions(2)
      unlockService.web3.eth = {
        getCode: jest.fn(() => {
          return Promise.resolve('0x')
        }),
      }
      try {
        await unlockService.unlockContractAbiVersion()
      } catch (error) {
        expect(error.message).toEqual(Errors.NON_DEPLOYED_CONTRACT)
      }
      expect(unlockService.web3.eth.getCode).toHaveBeenCalledWith(unlockAddress)
    })

    it('should throw UNKNOWN_CONTRACT if the opCode does not match any version', async () => {
      expect.assertions(2)
      unlockService.web3.eth = {
        getCode: jest.fn(() => {
          return Promise.resolve('0xabc')
        }),
      }
      try {
        await unlockService.unlockContractAbiVersion()
      } catch (error) {
        expect(error.message).toEqual(Errors.UNKNOWN_CONTRACT)
      }
      expect(unlockService.web3.eth.getCode).toHaveBeenCalledWith(unlockAddress)
    })

    it('should memoize the result', async () => {
      expect.assertions(2)
      unlockService.web3.eth = {
        getCode: jest.fn(),
      }
      unlockService.opCodeForAddress[unlockAddress] =
        UnlockV0.Unlock.deployedBytecode
      const version = await unlockService.unlockContractAbiVersion()
      expect(unlockService.web3.eth.getCode).not.toHaveBeenCalled()
      expect(version).toEqual(v0)
    })
  })
})
