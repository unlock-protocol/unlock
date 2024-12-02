import Web3Service from '../web3Service'
import PublicLockVersions from '../PublicLock'
import networks from '@unlock-protocol/networks'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { chainId, setupTest, setupLock } from './helpers/integration'
import nodeSetup from './setup/prepare-eth-node-for-unlock'
import locks from './helpers/fixtures/locks'
import { ethers } from 'ethers'

var web3Service = new Web3Service(networks)
const lock = {
  address: '0xe6A85e67905d41A479A32FF59892861351c825E8',
  network: 10,
}

describe('Web3Service', () => {
  describe('versions', () => {
    const versionSpecificLockMethods = ['getLock']
    it.each(versionSpecificLockMethods)(
      'should invoke the implementation of the corresponding version of %s',
      async (method) => {
        expect.assertions(3)
        const args = [lock.address, lock.network]
        const result = {
          unlockContractAddress: networks[lock.network].unlockAddress,
        }
        const version = {
          [method](_args) {
            // Needs to be a function because it is bound to web3Service
            expect(this).toBe(web3Service)
            expect(_args).toBe(...args)
            return result
          },
        }
        web3Service.getUnlockContract = vi.fn(() => ({
          locks: vi.fn(() => ({ deployed: true })),
        }))
        web3Service.lockContractAbiVersion = vi.fn(() => version)
        const r = await web3Service[method](...args)
        expect(r).toBe(result)
      }
    )

    // for each supported version, let's make sure it implements all methods
    it.each(Object.keys(PublicLockVersions))(
      'should implement all the required methods',
      (versionNumber) => {
        expect.assertions(1)
        const version = PublicLockVersions[versionNumber]
        versionSpecificLockMethods.forEach((method) => {
          expect(version[method]).toBeInstanceOf(Function)
        })
      }
    )
  })

  describe('Lock validation', () => {
    it.each(Object.keys(PublicLockVersions))(
      'getLock validation on public lock %s',
      async () => {
        expect.assertions(2)
        const service = new Web3Service(networks)
        service.getUnlockContract = vi.fn(() => ({
          locks: vi.fn(() => ({ deployed: true })),
        }))
        // Fake implementation of getLock
        const version = {
          getLock: (_args) => {
            return {
              unlockContractAddress: networks[lock.network].unlockAddress,
            }
          },
        }
        service.lockContractAbiVersion = vi.fn(() => version)

        const response = await service.getLock(lock.address, 10)
        expect(response.address).toBe(lock.address)
        const notFromUnlockFactoryContract = async () => {
          service.getUnlockContract = vi.fn(() => ({
            locks: vi.fn(() => ({ deployed: false })),
          }))
          const response = await service.getLock(
            '0xAfC5356c67853fC8045586722fE6a253023039eB',
            10
          )
          return response
        }
        await expect(notFromUnlockFactoryContract).rejects.toThrow()
      }
    )
  })

  describe('recoverAccountFromSignedData', () => {
    it('returns the signing address', async () => {
      expect.hasAssertions()

      const data = 'hello world'
      const account = '0x14791697260E4c9A71f18484C9f997B308e59325'
      const signature =
        '0xddd0a7290af9526056b4e35a077b9a11b513aa0028ec6c9880948544508f3c63' +
        '265e99e47ad31bb2cab9646c504576b3abc6939a1710afc08cbf3034d73214b8' +
        '1c'

      const returnedAddress = await web3Service.recoverAccountFromSignedData(
        data,
        signature
      )

      expect(returnedAddress).toBe(account)
    })
  })

  describe('build tx without submitting it', () => {
    let accounts, web3Service, walletService
    let lock, lockAddress
    const unlockVersion = 'v13'
    const publicLockVersion = 'v15'
    describe.each(
      locks[publicLockVersion].map((lock, index) => [index, lock.name, lock])
    )('lock %i: %s', async (lockIndex, lockName, lockParams) => {
      beforeAll(async () => {
        // deploy ERC20 and set balances
        const ERC20 = await nodeSetup()
        ;({ accounts, walletService, web3Service } =
          await setupTest(unlockVersion))

        global.suiteData = {
          ...global.suiteData,
          web3Service,
        }
        ;({ lock, lockAddress } = await setupLock({
          walletService,
          web3Service,
          publicLockVersion,
          unlockVersion,
          lockParams,
          ERC20,
        }))
      })
      describe('purchaseKey', () => {
        let approvalTx
        let purchaseTx

        beforeAll(async () => {
          const [keyOwner] = accounts
          const txs = await web3Service.purchaseKey({
            lockAddress: lockAddress,
            network: chainId,
            params: {
              owner: keyOwner,
              lockAddress: lock.address,
            },
          })
          if (lock.currencyContractAddress) {
            ;[approvalTx, purchaseTx] = txs
          } else {
            ;[purchaseTx] = txs
          }
        })
        it('parse correctly purchase tx', async () => {
          expect.assertions(2)
          expect(purchaseTx.to).toBe(lockAddress)
          expect(ethers.formatEther(purchaseTx.value)).toBe(
            lock.currencyContractAddress ? '0.0' : lock.keyPrice
          )
        })
        it('parse adds allowance tx if erc20', async () => {
          // check that approval tx has been added
          if (!lock.currencyContractAddress) {
            expect.assertions(1)
            expect(approvalTx).toBeUndefined()
          } else {
            expect.assertions(2)
            expect(approvalTx.to).toBe(lock.currencyContractAddress)
            expect(approvalTx.value).toBe(0)
          }
        })
      })
      describe('purchaseKeys', () => {
        let approvalTx
        let purchaseTx

        beforeAll(async () => {
          const [keyOwner] = accounts
          const txs = await web3Service.purchaseKeys({
            lockAddress: lockAddress,
            network: chainId,
            params: {
              owners: [keyOwner],
              lockAddress: lock.address,
            },
          })
          if (lock.currencyContractAddress) {
            ;[approvalTx, purchaseTx] = txs
          } else {
            ;[purchaseTx] = txs
          }
        })
        it('parse correctly purchase tx', async () => {
          expect.assertions(2)
          expect(purchaseTx.to).toBe(lockAddress)
          expect(ethers.formatEther(purchaseTx.value)).toBe(
            lock.currencyContractAddress ? '0.0' : lock.keyPrice
          )
        })
        it('parse adds allowance tx if erc20', async () => {
          // check that approval tx has been added
          if (!lock.currencyContractAddress) {
            expect.assertions(1)
            expect(approvalTx).toBeUndefined()
          } else {
            expect.assertions(2)
            expect(approvalTx.to).toBe(lock.currencyContractAddress)
            expect(approvalTx.value).toBe(0)
          }
        })
      })
    })
  })
})
