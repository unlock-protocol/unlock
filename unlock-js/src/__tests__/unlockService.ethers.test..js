/* eslint no-console: 0 */

import { providers as ethersProviders, ethers } from 'ethers'

import UnlockService, { Errors } from '../unlockService'
import NockHelper from './helpers/nockHelper'
import v0 from '../v0'
import v01 from '../v01'
import v02 from '../v02'

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */, true /** ethers */)

// This unlock address smart contract is fake
let unlockAddress = '0x885ef47c3439ade0cb9b33a4d3c534c99964db93'
let unlockService

describe('UnlockService', () => {
  async function nockBeforeEach() {
    nock.cleanAll()
    nock.netVersionAndYield(0)

    unlockService = new UnlockService({
      unlockAddress,
    })
    unlockService.provider = new ethersProviders.JsonRpcProvider(endpoint)
    await nock.resolveWhenAllNocksUsed()
  }

  describe('errors', () => {
    it('ethers_unlockContractAbiVersion throws if provider is not set', async () => {
      expect.assertions(1)
      await nockBeforeEach()
      unlockService.provider = null

      try {
        await unlockService.ethers_unlockContractAbiVersion()
      } catch (e) {
        expect(e.message).toBe(Errors.MISSING_WEB3)
      }
    })

    it('ethers_lockContractAbiVersion throws if provider is not set', async () => {
      expect.assertions(1)
      await nockBeforeEach()
      unlockService.provider = null

      try {
        await unlockService.ethers_lockContractAbiVersion(1)
      } catch (e) {
        expect(e.message).toBe(Errors.MISSING_WEB3)
      }
    })
  })

  describe('_ethers_getPublicLockVersionFromContract', () => {
    it('calls publicLockVersion', async () => {
      expect.assertions(1)
      await nockBeforeEach()
      const metadata = new ethers.utils.Interface(v02.PublicLock.abi)
      const coder = ethers.utils.defaultAbiCoder

      nock.ethGetCodeAndYield(unlockAddress, v02.PublicLock.deployedBytecode)
      nock.ethCallAndYield(
        metadata.functions['publicLockVersion()'].encode([]),
        ethers.utils.getAddress(unlockAddress),
        coder.encode(['uint256'], [ethers.utils.bigNumberify(1)])
      )

      const result = await unlockService._ethers_getPublicLockVersionFromContract(
        unlockAddress
      )

      // this test fails if the call does not occur
      await nock.resolveWhenAllNocksUsed()
      expect(result).toBe(1)
    })
  })

  describe('_ethers_getVersionFromContract', () => {
    it('calls publicLockVersion', async () => {
      expect.assertions(1)
      await nockBeforeEach()
      const metadata = new ethers.utils.Interface(v02.Unlock.abi)
      const coder = ethers.utils.defaultAbiCoder

      nock.ethGetCodeAndYield(unlockAddress, v02.Unlock.deployedBytecode)
      nock.ethCallAndYield(
        metadata.functions['unlockVersion()'].encode([]),
        ethers.utils.getAddress(unlockAddress),
        coder.encode(['uint256'], [ethers.utils.bigNumberify(1)])
      )

      const result = await unlockService._ethers_getVersionFromContract(
        unlockAddress
      )

      // this test fails if the call does not occur
      await nock.resolveWhenAllNocksUsed()
      expect(result).toBe(1)
    })
  })

  describe('ethers_unlockContractAbiVersion', () => {
    it('should return the v2 implementation when the opCode matches', async () => {
      expect.assertions(3)
      await nockBeforeEach()
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
      await nockBeforeEach()
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

    it('should return v01 if version is 1', async () => {
      expect.assertions(3)
      await nockBeforeEach()
      unlockService._ethers_getVersionFromContract = jest.fn(() => {
        return Promise.resolve(1)
      })

      const version = await unlockService.ethers_unlockContractAbiVersion()

      expect(unlockService._ethers_getVersionFromContract).toHaveBeenCalledWith(
        unlockAddress
      )
      expect(version).toEqual(v01)
      expect(unlockService.ethers_versionForAddress[unlockAddress]).toEqual(1)
    })

    it('should used the memoized the result', async () => {
      expect.assertions(2)
      await nockBeforeEach()
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
      await nockBeforeEach()
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
      await nockBeforeEach()
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
      await nockBeforeEach()
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

  describe('getContract', () => {
    it('returns a writable contract if service is writable', async () => {
      expect.assertions(1)
      await nockBeforeEach()
      unlockService.writable = true
      unlockService.getWritableContract = jest.fn()

      unlockService.getContract('address', 'contract')
      expect(unlockService.getWritableContract).toHaveBeenCalledWith(
        'address',
        'contract'
      )
    })

    it('creates a new ethers.Contract', async () => {
      expect.assertions(3)
      await nockBeforeEach()

      const fakeContract = {
        abi: ['booboo(uint256)'],
      }
      const contract = await unlockService.getContract(
        '0x1234567890123456789012345678901234567890',
        fakeContract
      )
      expect(contract).toBeInstanceOf(ethers.Contract)
      expect(contract.signer).toBeNull()
      expect(contract.provider).toBe(unlockService.provider)
    })
  })

  describe('getWritableContract', () => {
    it('creates a new writable ethers.Contract', async () => {
      expect.assertions(3)
      await nockBeforeEach()

      const fakeContract = {
        abi: ['booboo(uint256)'],
      }
      const contract = await unlockService.getWritableContract(
        '0x1234567890123456789012345678901234567890',
        fakeContract
      )
      expect(contract).toBeInstanceOf(ethers.Contract)
      expect(contract.signer).not.toBeNull()
      expect(contract.provider).toBe(unlockService.provider)
    })
  })

  describe('getLockContract', () => {
    it('returns and memoizes the lock contract', async () => {
      expect.assertions(3)
      await nockBeforeEach()
      const lockAddress = '0x1234567890123456789012345678901234567890'

      unlockService.ethers_lockContractAbiVersion = jest.fn(() => v02)

      const contract = await unlockService.getLockContract(lockAddress)

      expect(unlockService.lockContracts[lockAddress]).toBeInstanceOf(
        ethers.Contract
      )
      expect(contract).toBeInstanceOf(ethers.Contract)
      expect(contract.interface.abi).toEqual(v02.PublicLock.abi)
    })

    it('retrieves memoized lock contract', async () => {
      expect.assertions(2)
      await nockBeforeEach()
      const lockAddress = '0x1234567890123456789012345678901234567890'

      unlockService.ethers_lockContractAbiVersion = jest.fn(() => v02)
      unlockService.lockContracts = {
        [lockAddress]: 'hi',
      }

      const contract = await unlockService.getLockContract(lockAddress)

      expect(unlockService.ethers_lockContractAbiVersion).not.toHaveBeenCalled()
      expect(contract).toBe('hi')
    })
  })

  describe('getUnlockContract', () => {
    it('returns and memoizes the unlock contract', async () => {
      expect.assertions(3)
      await nockBeforeEach()

      unlockService.ethers_unlockContractAbiVersion = jest.fn(() => v02)

      const contract = await unlockService.getUnlockContract()

      expect(unlockService.unlockContract).toBeInstanceOf(ethers.Contract)
      expect(contract).toBeInstanceOf(ethers.Contract)
      expect(contract.interface.abi).toEqual(v02.Unlock.abi)
    })

    it('retrieves memoized unlock contract', async () => {
      expect.assertions(2)
      await nockBeforeEach()

      unlockService.ethers_unlockContractAbiVersion = jest.fn(() => v02)

      unlockService.unlockContract = 'hi'

      const contract = await unlockService.getUnlockContract()

      expect(
        unlockService.ethers_unlockContractAbiVersion
      ).not.toHaveBeenCalled()
      expect(contract).toBe('hi')
    })
  })
})
