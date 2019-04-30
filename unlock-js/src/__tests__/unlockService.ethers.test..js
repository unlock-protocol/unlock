/* eslint no-console: 0 */

import { providers as ethersProviders } from 'ethers'

import UnlockService from '../unlockService'
import NockHelper from './helpers/nockHelper'
import v0 from '../v0'
import v02 from '../v02'

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */)

// This unlock address smart contract is fake
let unlockAddress = '0x885ef47c3439ade0cb9b33a4d3c534c99964db93'
let unlockService

describe('UnlockService', () => {
  beforeEach(() => {
    nock.cleanAll()
    unlockService = new UnlockService({
      unlockAddress,
    })
    unlockService.provider = new ethersProviders.JsonRpcProvider(endpoint)
  })

  describe('ethers_unlockContractAbiVersion', () => {
    it('should return the v2 implementation when the opCode matches', async () => {
      expect.assertions(3)
      unlockService._ethers_getVersionFromContract = jest.fn(() => {
        return Promise.resolve(2)
      })
      const version = await unlockService.ethers_unlockContractAbiVersion()

      expect(unlockService._ethers_getVersionFromContract).toHaveBeenCalledWith(
        unlockAddress
      )
      expect(version).toEqual(v02)
      expect(unlockService.ethers_versionForAddress[unlockAddress]).toEqual(2)
    })

    it('should return v0 by default', async () => {
      expect.assertions(3)
      unlockService._ethers_getVersionFromContract = jest.fn(() => {
        return Promise.resolve(0)
      })

      const version = await unlockService.ethers_unlockContractAbiVersion()

      expect(unlockService._ethers_getVersionFromContract).toHaveBeenCalledWith(
        unlockAddress
      )
      expect(version).toEqual(v0)
      expect(unlockService.ethers_versionForAddress[unlockAddress]).toEqual(0)
    })

    it('should used the memoized the result', async () => {
      expect.assertions(2)
      unlockService._ethers_getVersionFromContract = jest.fn(() => {})
      unlockService.ethers_versionForAddress[unlockAddress] = 2
      const version = await unlockService.ethers_unlockContractAbiVersion()
      expect(
        unlockService._ethers_getVersionFromContract
      ).not.toHaveBeenCalled()
      expect(version).toEqual(v02)
    })
  })

  describe('lockContractAbiVersion', () => {
    it('should return UnlockV0 when the version matches', async () => {
      expect.assertions(3)
      unlockService._ethers_getPublicLockVersionFromContract = jest.fn(() => {
        return Promise.resolve(0)
      })

      const address = '0xabc'
      const version = await unlockService.ethers_lockContractAbiVersion(address)

      expect(
        unlockService._ethers_getPublicLockVersionFromContract
      ).toHaveBeenCalledWith(address)
      expect(version).toEqual(v0)
      expect(unlockService.ethers_versionForAddress[address]).toEqual(0)
    })

    it('should return UnlockV01 when the version matches', async () => {
      expect.assertions(3)
      unlockService._ethers_getPublicLockVersionFromContract = jest.fn(() => {
        return Promise.resolve(1) // See code for explaination
      })

      const address = '0xabc'
      const version = await unlockService.ethers_lockContractAbiVersion(address)

      expect(
        unlockService._ethers_getPublicLockVersionFromContract
      ).toHaveBeenCalledWith(address)
      expect(version).toEqual(v02)
      expect(unlockService.ethers_versionForAddress[address]).toEqual(1)
    })

    it('should memoize the result', async () => {
      expect.assertions(3)
      unlockService._ethers_getPublicLockVersionFromContract = jest.fn(() => {})

      const address = '0xabc'
      unlockService.ethers_versionForAddress[address] = 1
      const version = await unlockService.ethers_lockContractAbiVersion(address)

      expect(
        unlockService._ethers_getPublicLockVersionFromContract
      ).not.toHaveBeenCalled()
      expect(version).toEqual(v02)
      expect(unlockService.ethers_versionForAddress[address]).toEqual(1)
    })
  })
})
