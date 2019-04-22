/* eslint no-console: 0 */

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

    describe('if the opCode does not match any version', () => {
      it('should get the implementation address from the proxy contract and match v0', async () => {
        expect.assertions(3)
        const implementationAddress = '0x123'
        unlockService.web3.eth = {
          getCode: jest.fn(address => {
            if (address == implementationAddress) {
              return Promise.resolve(UnlockV0.Unlock.deployedBytecode)
            } else {
              // Proxy!
              return Promise.resolve('0xabc')
            }
          }),
        }
        unlockService._getImplementationAddressFromProxy = jest.fn(() => {
          return implementationAddress
        })

        const version = await unlockService.unlockContractAbiVersion()
        expect(version).toEqual(v0)
        expect(unlockService.web3.eth.getCode).toHaveBeenCalledWith(
          unlockAddress
        )
        expect(
          unlockService._getImplementationAddressFromProxy
        ).toHaveBeenCalledWith(unlockAddress)
      })

      it('should get the implementation address from the proxy contract and match v01', async () => {
        expect.assertions(3)
        const implementationAddress = '0x123'
        unlockService.web3.eth = {
          getCode: jest.fn(address => {
            if (address == implementationAddress) {
              return Promise.resolve(UnlockV01.Unlock.deployedBytecode)
            } else {
              // Proxy!
              return Promise.resolve('0xabc')
            }
          }),
        }
        unlockService._getImplementationAddressFromProxy = jest.fn(() => {
          return implementationAddress
        })

        const version = await unlockService.unlockContractAbiVersion()
        expect(version).toEqual(v01)
        expect(unlockService.web3.eth.getCode).toHaveBeenCalledWith(
          unlockAddress
        )
        expect(
          unlockService._getImplementationAddressFromProxy
        ).toHaveBeenCalledWith(unlockAddress)
      })

      it('should throw an error of the opCode is not a proxy', async () => {
        expect.assertions(3)
        unlockService._contractAbiVersionFromAddress = jest.fn(() => {
          return
        })
        unlockService._getImplementationAddressFromProxy = jest.fn(() => {
          throw new Error('not a proxy')
        })
        try {
          await unlockService.unlockContractAbiVersion()
        } catch (error) {
          expect(error.message).toEqual(Errors.UNKNOWN_CONTRACT)
        }
        expect(
          unlockService._contractAbiVersionFromAddress
        ).toHaveBeenCalledWith(unlockAddress)
        expect(
          unlockService._getImplementationAddressFromProxy
        ).toHaveBeenCalledWith(unlockAddress)
      })

      // TODO: this test should be removed and replaced by the next skipped test
      it('should default to v0 if the version still could not be identified by the proxy', async () => {
        expect.assertions(3)
        const implementationAddress = '0x123'
        const proxyOpCode = '0xabc'
        const implementationOpCode = '0xdef'
        unlockService.web3.eth = {
          getCode: jest.fn(address => {
            if (address == implementationAddress) {
              return Promise.resolve(implementationOpCode)
            } else {
              // Proxy!
              return Promise.resolve(proxyOpCode)
            }
          }),
        }

        unlockService._getImplementationAddressFromProxy = jest.fn(() => {
          return implementationAddress
        })

        const version = await unlockService.unlockContractAbiVersion()
        expect(version).toEqual(v0)
        expect(unlockService.web3.eth.getCode).toHaveBeenCalledWith(
          unlockAddress
        )
        expect(
          unlockService._getImplementationAddressFromProxy
        ).toHaveBeenCalledWith(unlockAddress)
      })

      // TODO: restore that when we have the default behavior in place
      it.skip('should throw UNKNOWN_CONTRACT if the opCode does not match any version', async () => {
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
        expect(unlockService.web3.eth.getCode).toHaveBeenCalledWith(
          unlockAddress
        )
      })
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

  describe('lockContractAbiVersion', () => {
    it('should return UnlockV0 when the opCode matches', async () => {
      expect.assertions(2)
      unlockService.web3.eth = {
        getCode: jest.fn(() => {
          return Promise.resolve(UnlockV0.PublicLock.deployedBytecode)
        }),
      }
      const address = '0xabc'
      const version = await unlockService.lockContractAbiVersion(address)

      expect(unlockService.web3.eth.getCode).toHaveBeenCalledWith(address)
      expect(version).toEqual(v0)
    })

    it('should return UnlockV01 when the opCode matches', async () => {
      expect.assertions(2)
      unlockService.web3.eth = {
        getCode: jest.fn(() => {
          return Promise.resolve(UnlockV01.PublicLock.deployedBytecode)
        }),
      }
      const address = '0xabc'
      const version = await unlockService.lockContractAbiVersion(address)

      expect(unlockService.web3.eth.getCode).toHaveBeenCalledWith(address)
      expect(version).toEqual(v01)
    })

    it('should throw NON_DEPLOYED_CONTRACT if the opCode is 0x', async () => {
      expect.assertions(2)
      unlockService.web3.eth = {
        getCode: jest.fn(() => {
          return Promise.resolve('0x')
        }),
      }
      const address = '0xabc'
      try {
        await unlockService.lockContractAbiVersion(address)
      } catch (error) {
        expect(error.message).toEqual(Errors.NON_DEPLOYED_CONTRACT)
      }
      expect(unlockService.web3.eth.getCode).toHaveBeenCalledWith(address)
    })

    // This test should be removed in favor of the next one once we changed the behavior on default
    it('should default to v0 if the opCode does not match any version', async () => {
      expect.assertions(2)
      unlockService.web3.eth = {
        getCode: jest.fn(() => {
          return Promise.resolve('0xabc')
        }),
      }
      const address = '0xabc'
      const version = await unlockService.lockContractAbiVersion(address)
      expect(unlockService.web3.eth.getCode).toHaveBeenCalledWith(address)
      expect(version).toEqual(v0)
    })

    it.skip('should throw UNKNOWN_CONTRACT if the opCode does not match any version', async () => {
      expect.assertions(2)
      unlockService.web3.eth = {
        getCode: jest.fn(() => {
          return Promise.resolve('0xabc')
        }),
      }
      const address = '0xabc'
      try {
        await unlockService.lockContractAbiVersion(address)
      } catch (error) {
        expect(error.message).toEqual(Errors.UNKNOWN_CONTRACT)
      }
      expect(unlockService.web3.eth.getCode).toHaveBeenCalledWith(address)
    })

    it('should memoize the result', async () => {
      expect.assertions(2)
      unlockService.web3.eth = {
        getCode: jest.fn(),
      }
      const address = '0xabc'
      unlockService.opCodeForAddress[address] =
        UnlockV0.PublicLock.deployedBytecode
      const version = await unlockService.lockContractAbiVersion(address)
      expect(unlockService.web3.eth.getCode).not.toHaveBeenCalled()
      expect(version).toEqual(v0)
    })
  })
})
