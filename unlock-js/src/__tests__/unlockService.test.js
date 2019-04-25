/* eslint no-console: 0 */

import Web3 from 'web3'

import UnlockService from '../unlockService'
import NockHelper from './helpers/nockHelper'
import v0 from '../v0'
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

  describe('lockContractAbiVersion', () => {
    it('should return UnlockV0 when the version matches', async () => {
      expect.assertions(3)
      unlockService._getPublicLockVersionFromContract = jest.fn(() => {
        return Promise.resolve(0)
      })

      const address = '0xabc'
      const version = await unlockService.lockContractAbiVersion(address)

      expect(
        unlockService._getPublicLockVersionFromContract
      ).toHaveBeenCalledWith(address)
      expect(version).toEqual(v0)
      expect(unlockService.versionForAddress[address]).toEqual(0)
    })

    it('should return UnlockV01 when the version matches', async () => {
      expect.assertions(3)
      unlockService._getPublicLockVersionFromContract = jest.fn(() => {
        return Promise.resolve(1) // See code for explaination
      })

      const address = '0xabc'
      const version = await unlockService.lockContractAbiVersion(address)

      expect(
        unlockService._getPublicLockVersionFromContract
      ).toHaveBeenCalledWith(address)
      expect(version).toEqual(v02)
      expect(unlockService.versionForAddress[address]).toEqual(1)
    })

    it('should memoize the result', async () => {
      expect.assertions(3)
      unlockService._getPublicLockVersionFromContract = jest.fn(() => {})

      const address = '0xabc'
      unlockService.versionForAddress[address] = 1
      const version = await unlockService.lockContractAbiVersion(address)

      expect(
        unlockService._getPublicLockVersionFromContract
      ).not.toHaveBeenCalled()
      expect(version).toEqual(v02)
      expect(unlockService.versionForAddress[address]).toEqual(1)
    })
  })
})
