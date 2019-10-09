/* eslint no-console: 0 */

import { providers as ethersProviders, ethers, utils } from 'ethers'

import UnlockService, { Errors } from '../unlockService'
import NockHelper from './helpers/nockHelper'
import bytecode from './helpers/bytecode'
import v0 from '../v0'
import v01 from '../v01'
import v02 from '../v02'

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */)

// This unlock address smart contract is fake
let unlockAddress = '0x885ef47c3439ade0cb9b33a4d3c534c99964db93'
let unlockService

describe('UnlockService', () => {
  // this helper is used to generate the kind of structure that is used internally by ethers.
  // by using this, we can assert against a contract being the same in tests below
  function parseAbi(abi) {
    return abi.map(sig => utils.parseSignature(sig))
  }

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
    it('unlockContractAbiVersion throws if provider is not set', async () => {
      expect.assertions(1)
      await nockBeforeEach()
      unlockService.provider = null

      try {
        await unlockService.unlockContractAbiVersion()
      } catch (e) {
        expect(e.message).toBe(Errors.MISSING_WEB3)
      }
    })

    it('lockContractAbiVersion throws if provider is not set', async () => {
      expect.assertions(1)
      await nockBeforeEach()
      unlockService.provider = null

      try {
        await unlockService.lockContractAbiVersion(1)
      } catch (e) {
        expect(e.message).toBe(Errors.MISSING_WEB3)
      }
    })
  })

  describe('_getPublicLockVersionFromContract', () => {
    it('returns 0 for v0, which does not have publicLockVersion', async () => {
      expect.assertions(1)
      await nockBeforeEach()
      const metadata = new ethers.utils.Interface(v02.PublicLock.abi)

      nock.ethGetCodeAndYield(unlockAddress, bytecode.v02.PublicLock)
      nock.ethCallAndFail(
        metadata.functions['publicLockVersion()'].encode([]),
        ethers.utils.getAddress(unlockAddress),
        { code: 404 }
      )

      const result = await unlockService._getPublicLockVersionFromContract(
        unlockAddress
      )

      // this test fails if the call does not occur
      await nock.resolveWhenAllNocksUsed()
      expect(result).toBe(0)
    })

    it('returns 1 for contract version 1', async () => {
      expect.assertions(1)
      await nockBeforeEach()
      const metadata = new ethers.utils.Interface(v01.PublicLock.abi)
      const coder = ethers.utils.defaultAbiCoder

      nock.ethGetCodeAndYield(unlockAddress, bytecode.v01.PublicLock)
      nock.ethCallAndYield(
        metadata.functions['publicLockVersion()'].encode([]),
        ethers.utils.getAddress(unlockAddress),
        coder.encode(['uint256'], [ethers.utils.bigNumberify(1)])
      )
      nock.ethGetCodeAndYield(unlockAddress, bytecode.v01.PublicLock)

      const result = await unlockService._getPublicLockVersionFromContract(
        unlockAddress
      )

      // this test fails if the call does not occur
      await nock.resolveWhenAllNocksUsed()
      expect(result).toBe(1)
    })

    it('returns 2 for contract version 2', async () => {
      expect.assertions(1)
      await nockBeforeEach()
      const metadata = new ethers.utils.Interface(v02.PublicLock.abi)
      const coder = ethers.utils.defaultAbiCoder

      nock.ethGetCodeAndYield(unlockAddress, bytecode.v02.PublicLock)
      nock.ethCallAndYield(
        metadata.functions['publicLockVersion()'].encode([]),
        ethers.utils.getAddress(unlockAddress),
        coder.encode(['uint256'], [ethers.utils.bigNumberify(1)])
      )
      nock.ethGetCodeAndYield(unlockAddress, bytecode.v02.PublicLock)

      const result = await unlockService._getPublicLockVersionFromContract(
        unlockAddress
      )

      // this test fails if the call does not occur
      await nock.resolveWhenAllNocksUsed()
      expect(result).toBe(2)
    })
  })

  describe('_getVersionFromContract', () => {
    it('calls publicLockVersion', async () => {
      expect.assertions(1)
      await nockBeforeEach()
      const metadata = new ethers.utils.Interface(v02.Unlock.abi)
      const coder = ethers.utils.defaultAbiCoder

      nock.ethGetCodeAndYield(unlockAddress, bytecode.v02.Unlock)
      nock.ethCallAndYield(
        metadata.functions['unlockVersion()'].encode([]),
        ethers.utils.getAddress(unlockAddress),
        coder.encode(['uint256'], [ethers.utils.bigNumberify(1)])
      )

      const result = await unlockService._getVersionFromContract(unlockAddress)

      // this test fails if the call does not occur
      await nock.resolveWhenAllNocksUsed()
      expect(result).toBe(1)
    })
  })

  describe('unlockContractAbiVersion', () => {
    it('should return the v2 implementation when the opCode matches', async () => {
      expect.assertions(3)
      await nockBeforeEach()
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
      await nockBeforeEach()
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

    it('should return v01 if version is 1', async () => {
      expect.assertions(3)
      await nockBeforeEach()
      unlockService._getVersionFromContract = jest.fn(() => {
        return Promise.resolve(1)
      })

      const version = await unlockService.unlockContractAbiVersion()

      expect(unlockService._getVersionFromContract).toHaveBeenCalledWith(
        unlockAddress
      )
      expect(version).toEqual(v01)
      expect(unlockService.versionForAddress[unlockAddress]).toEqual(1)
    })

    it('should used the memoized the result', async () => {
      expect.assertions(2)
      await nockBeforeEach()
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
      await nockBeforeEach()
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
      await nockBeforeEach()
      unlockService._getPublicLockVersionFromContract = jest.fn(() => {
        return Promise.resolve(1) // See code for explaination
      })

      const address = '0xabc'
      const version = await unlockService.lockContractAbiVersion(address)

      expect(
        unlockService._getPublicLockVersionFromContract
      ).toHaveBeenCalledWith(address)
      expect(version).toEqual(v01)
      expect(unlockService.versionForAddress[address]).toEqual(1)
    })

    it('should return UnlockV02 when the version matches', async () => {
      expect.assertions(3)
      await nockBeforeEach()
      unlockService._getPublicLockVersionFromContract = jest.fn(() => {
        return Promise.resolve(2) // See code for explaination
      })

      const address = '0xabc'
      const version = await unlockService.lockContractAbiVersion(address)

      expect(
        unlockService._getPublicLockVersionFromContract
      ).toHaveBeenCalledWith(address)
      expect(version).toEqual(v02)
      expect(unlockService.versionForAddress[address]).toEqual(2)
    })

    it('should memoize the result', async () => {
      expect.assertions(3)
      await nockBeforeEach()
      unlockService._getPublicLockVersionFromContract = jest.fn(() => {})

      const address = '0xabc'
      unlockService.versionForAddress[address] = 2
      const version = await unlockService.lockContractAbiVersion(address)

      expect(
        unlockService._getPublicLockVersionFromContract
      ).not.toHaveBeenCalled()
      expect(version).toEqual(v02)
      expect(unlockService.versionForAddress[address]).toEqual(2)
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

      unlockService.lockContractAbiVersion = jest.fn(() => v02)

      const contract = await unlockService.getLockContract(lockAddress)

      expect(unlockService.lockContracts[lockAddress]).toBeInstanceOf(
        ethers.Contract
      )
      expect(contract).toBeInstanceOf(ethers.Contract)
      expect(contract.interface.abi).toEqual(parseAbi(v02.PublicLock.abi))
    })

    it('retrieves memoized lock contract', async () => {
      expect.assertions(2)
      await nockBeforeEach()
      const lockAddress = '0x1234567890123456789012345678901234567890'

      unlockService.lockContractAbiVersion = jest.fn(() => v02)
      unlockService.lockContracts = {
        [lockAddress]: 'hi',
      }

      const contract = await unlockService.getLockContract(lockAddress)

      expect(unlockService.lockContractAbiVersion).not.toHaveBeenCalled()
      expect(contract).toBe('hi')
    })
  })

  describe('getUnlockContract', () => {
    it('returns and memoizes the unlock contract', async () => {
      expect.assertions(3)
      await nockBeforeEach()

      unlockService.unlockContractAbiVersion = jest.fn(() => v02)

      const contract = await unlockService.getUnlockContract()

      expect(unlockService.unlockContract).toBeInstanceOf(ethers.Contract)
      expect(contract).toBeInstanceOf(ethers.Contract)
      expect(contract.interface.abi).toEqual(parseAbi(v02.Unlock.abi))
    })

    it('retrieves memoized unlock contract', async () => {
      expect.assertions(2)
      await nockBeforeEach()

      unlockService.unlockContractAbiVersion = jest.fn(() => v02)

      unlockService.unlockContract = 'hi'

      const contract = await unlockService.getUnlockContract()

      expect(unlockService.unlockContractAbiVersion).not.toHaveBeenCalled()
      expect(contract).toBe('hi')
    })
  })
})
