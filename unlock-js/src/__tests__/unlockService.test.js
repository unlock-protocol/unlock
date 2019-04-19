/* eslint no-console: 0 */

import Web3 from 'web3'
import * as UnlockV0 from 'unlock-abi-0'
import * as UnlockV01 from 'unlock-abi-0-1'
import * as UnlockV02 from 'unlock-abi-0-2'

import UnlockService, { Errors } from '../unlockService'
import NockHelper from './helpers/nockHelper'
import v0 from '../v0'
import v01 from '../v01'
import v02 from '../v02'

const endpoint = 'http://127.0.0.1:8545'
const provider = new Web3.providers.HttpProvider(endpoint)
const nock = new NockHelper(endpoint, true /** debug */)

// This unlock address smart contract is fake
let unlockAddress = '0x885ef47c3439ade0cb9b33a4d3c534c99964db93'
let unlockService

describe('UnlockService', () => {
  beforeEach(() => {
    nock.cleanAll()
    unlockService = new UnlockService({
      unlockAddress,
    })
    unlockService.web3 = new Web3(provider)
  })

  describe('unlockContractAbiVersion', () => {
    it('should return the v2 implementation when the opCode matches', async () => {
      expect.assertions(3)
      unlockService._getVersionFromContract = jest.fn(() => {
        return Promise.resolve(2)
      })
      const version = await unlockService.unlockContractAbiVersion()

      expect(unlockService._getVersionFromContract).toHaveBeenCalledWith(
        unlockAddress
      )
      expect(version).toEqual(v02)
      expect(unlockService.versionForAddress[unlockAddress]).toEqual(2)
    })

    it('should return v0 by default', async () => {
      expect.assertions(3)
      unlockService._getVersionFromContract = jest.fn(() => {
        return Promise.resolve(0)
      })

      const version = await unlockService.unlockContractAbiVersion()

      expect(unlockService._getVersionFromContract).toHaveBeenCalledWith(
        unlockAddress
      )
      expect(version).toEqual(v0)
      expect(unlockService.versionForAddress[unlockAddress]).toEqual(0)
    })

    it('should used the memoized the result', async () => {
      expect.assertions(2)
      unlockService._getVersionFromContract = jest.fn(() => {})
      unlockService.versionForAddress[unlockAddress] = 2
      const version = await unlockService.unlockContractAbiVersion()
      expect(unlockService._getVersionFromContract).not.toHaveBeenCalled()
      expect(version).toEqual(v02)
    })
  })

  describe('_getVersionFromContract', () => {
    it('should return the version number if there is one', async () => {
      expect.assertions(1)

      nock.ethCallAndYield(
        '0x4220bd46', //bytes4(keccak256('unlockVersion()'))
        unlockAddress,
        '0x0000000000000000000000000000000000000000000000000000000000000002'
      )
      const version = await unlockService._getVersionFromContract(unlockAddress)
      expect(version).toBe(2)
    })

    it('should return 0 if the contract does not have a version number', async () => {
      expect.assertions(1)

      nock.ethCallAndYield(
        '0x4220bd46' /*bytes4(keccak256('unlockVersion()'))*/,
        unlockAddress,
        {
          message:
            'VM Exception while processing transaction: revert NO_FALLBACK',
          code: -32000,
          data: {
            '0xbf4181f274c0d90e6f0ece0285cb98a13f8816ba09bd8111eec4ffa8fa06d5bb': {
              error: 'revert',
              program_counter: 305,
              return:
                '0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b4e4f5f46414c4c4241434b000000000000000000000000000000000000000000',
              reason: 'NO_FALLBACK',
            },
            stack:
              'o: VM Exception while processing transaction: revert NO_FALLBACK\n    at Function.o.fromResults (/Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:10:81931)\n    at /Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:47:121203\n    at /Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:61:1833282\n    at /Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:2:26124\n    at i (/Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:2:41179)\n    at /Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:61:1190532\n    at /Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:2:105418\n    at /Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:32:392\n    at c (/Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:32:5407)\n    at /Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:32:317\n    at /Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:61:1851708\n    at /Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:2:23237\n    at o (/Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:2:26646)\n    at /Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:2:26124\n    at /Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:61:1844745\n    at /Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:61:1842608\n    at /Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:61:1869821\n    at /Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:2:23237\n    at o (/Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:2:26646)\n    at /Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:2:26124\n    at /Users/julien/repos/unlock-shadow/node_modules/ganache-cli/build/ganache-core.node.cli.js:2:5439\n    at FSReqWrap.oncomplete (fs.js:135:15)',
            name: 'o',
          },
        }
      )
      const version = await unlockService._getVersionFromContract(unlockAddress)
      expect(version).toBe(0)
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

    it('should return UnlockV02 when the opCode matches', async () => {
      expect.assertions(2)
      unlockService.web3.eth = {
        getCode: jest.fn(() => {
          return Promise.resolve(UnlockV02.PublicLock.deployedBytecode)
        }),
      }
      const address = '0xabc'
      const version = await unlockService.lockContractAbiVersion(address)

      expect(unlockService.web3.eth.getCode).toHaveBeenCalledWith(address)
      expect(version).toEqual(v02)
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
