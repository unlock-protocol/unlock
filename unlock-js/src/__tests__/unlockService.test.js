/* eslint no-console: 0 */

import { providers as ethersProviders, ethers } from 'ethers'

import UnlockService, { Errors } from '../unlockService'
import NockHelper from './helpers/nockHelper'

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */)

// This unlock address smart contract is fake
const unlockAddress = '0x'
let unlockService

describe('UnlockService', () => {
  // this helper is used to generate the kind of structure that is used internally by ethers.
  // by using this, we can assert against a contract being the same in tests below

  async function nockBeforeEach() {
    nock.cleanAll()
    nock.netVersionAndYield(0)

    unlockService = new UnlockService({
      unlockAddress,
    })
    const provider = new ethersProviders.JsonRpcProvider(endpoint)
    unlockService.signer = provider.getSigner()
    unlockService.provider = provider
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
})
