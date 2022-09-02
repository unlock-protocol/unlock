/* eslint-disable prefer-arrow-callback, func-names */
// tslint:disable-next-line no-implicit-dependencies
import { assert } from 'chai'
import type { Contract } from 'ethers'

import { networks } from '@unlock-protocol/networks'

import { useEnvironment } from './helpers'
// expectThrowsAsync
import type { CreateLockArgs } from '../src/createLock'

import {
  UNLOCK_LATEST_VERSION,
  PUBLIC_LOCK_LATEST_VERSION,
  TASK_CREATE_LOCK,
} from '../src/constants'
import { locks } from './fixtures'

const defaultSignerAddress = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'

const isIdenticalLock = async (lock: Contract, lockArgs: CreateLockArgs) => {
  assert.equal(await lock.publicLockVersion(), PUBLIC_LOCK_LATEST_VERSION)
  assert.equal(await lock.name(), lockArgs.name)
  assert.equal((await lock.keyPrice()).toString(), lockArgs.keyPrice.toString())
  assert.equal(await lock.maxNumberOfKeys(), lockArgs.maxNumberOfKeys)
  assert.equal(await lock.expirationDuration(), lockArgs.expirationDuration)
}

describe('Unlock Hardhat plugin', function () {
  describe('HRE extension', function () {
    useEnvironment('hardhat-project')

    it('Should add the unlock field', function () {
      assert.instanceOf(this.hre.unlock, Object)
    })

    it('should store networks info', function () {
      assert.isTrue(Object.keys(this.hre.unlock.networks).includes('31337'))
      assert.equal(
        this.hre.unlock.networks['31337'].name,
        'Custom Localhost Name'
      )
      assert.equal(this.hre.unlock.networks['31337'].id, networks['31337'].id)
      assert.equal(
        this.hre.unlock.networks['31337'].subgraphURI,
        networks['31337'].subgraphURI
      )
      assert.equal(
        this.hre.unlock.networks['31337'].locksmithUri,
        networks['31337'].locksmithUri
      )
    })

    describe('functions', function () {
      let protocol: {
        unlock: Contract
        publicLock: Contract
      }
      this.beforeEach(async function () {
        protocol = await this.hre.unlock.deployProtocol(this.hre)
      })

      describe('deployProtocol()', function () {
        it('Should deploy the PublicLock contract', async function () {
          const { publicLock } = protocol
          assert.isTrue(publicLock.address.includes('0x'))
          assert.equal(typeof publicLock.address, 'string')
        })
        it('Should deploy the Unlock contract', async function () {
          const { unlock } = protocol
          assert.isTrue(unlock.address.includes('0x'))
          assert.equal(typeof unlock.address, 'string')
        })
        it('Should set the Unlock owner correctly', async function () {
          const { unlock } = protocol
          assert.equal(
            (await unlock.owner()).toLowerCase(),
            defaultSignerAddress.toLowerCase()
          )
        })
        it('Should set the template correctly', async function () {
          const { unlock, publicLock } = protocol
          assert.equal(await unlock.publicLockAddress(), publicLock.address)
          assert.equal(await unlock.unlockVersion(), UNLOCK_LATEST_VERSION)
          assert.equal(
            await unlock.publicLockImpls(PUBLIC_LOCK_LATEST_VERSION),
            publicLock.address
          )
          assert.equal(
            await unlock.publicLockVersions(publicLock.address),
            PUBLIC_LOCK_LATEST_VERSION
          )
          assert.equal(
            await unlock.publicLockLatestVersion(),
            PUBLIC_LOCK_LATEST_VERSION
          )
        })
        it('Should store deployed Unlock address in hre', async function () {
          const { unlock } = protocol
          assert.equal(
            this.hre.unlock.networks['31337'].unlockAddress,
            unlock.address
          )
        })
      })

      describe('getUnlockContract()', function () {
        let protocol: {
          unlock: Contract
          publicLock: Contract
        }
        this.beforeEach(async function () {
          protocol = await this.hre.unlock.deployProtocol(this.hre)
        })
        it('Should retrieve the Unlock contract instance', async function () {
          const { unlock } = protocol
          const unlockGet = await this.hre.unlock.getUnlockContract(
            this.hre,
            unlock.address
          )
          assert.equal(typeof unlock, typeof unlockGet)
          assert.equal(unlock.address, unlockGet.address)
          assert.equal(await unlock.unlockVersion(), UNLOCK_LATEST_VERSION)
        })
        /*
      it('Should throw if the Unlock contract is not defined', async function () {
        await expectThrowsAsync(
          this.hre.unlock.getUnlockContract(hre, '0x'),
          [],
          'Could not fetch the Unlock contract'
        )
      })
      */
      })

      describe('createLock()', function () {
        it('Should create a new lock w correct params', async function () {
          const { FIRST } = locks
          const { lock, transactionHash, lockAddress } =
            await this.hre.unlock.createLock(this.hre, {
              ...FIRST,
            })

          assert.equal(await lockAddress, lock.address)
          assert.equal(typeof transactionHash, 'string')
          isIdenticalLock(lock, FIRST)
        })
      })

      describe('getLock()', function () {
        let lock: Contract
        const { FIRST } = locks
        this.beforeEach(async function () {
          await this.hre.unlock.deployProtocol(
            this.hre,
            undefined,
            undefined,
            1
          )
          ;({ lock } = await this.hre.unlock.createLock(this.hre, FIRST))
        })

        it('Should retrieve a lock w correct params', async function () {
          const lockGet = await this.hre.unlock.getLockContract(
            this.hre,
            lock.address
          )
          assert.equal(
            await lockGet.publicLockVersion(),
            PUBLIC_LOCK_LATEST_VERSION
          )
          isIdenticalLock(lock, FIRST)
        })
      })
    })
  })
})

describe('HardhatConfig unlock extension', function () {
  useEnvironment('hardhat-project')

  it('Should add existing unlock networks to the config', function () {
    assert.isTrue(Object.keys(this.hre.config).includes('unlock'))
    assert.deepEqual(
      Object.keys(this.hre.config.unlock).sort(),
      [...Object.keys(networks), '12345'].sort()
    )
  })

  it('Should allow user to configure exsiting network', function () {
    assert.equal(this.hre.config.unlock['31337'].name, 'Custom Localhost Name')
  })

  it('Should allow user to pass a new network', function () {
    assert.isTrue(Object.keys(this.hre.config.unlock).includes('12345'))
    assert.equal(this.hre.config.unlock['12345'].name, 'New Network')
    assert.equal(this.hre.config.unlock['12345'].id, 12345)
  })
})

describe('Tasks', function () {
  describe(TASK_CREATE_LOCK, function () {
    useEnvironment('hardhat-project')
    this.beforeEach(async function () {
      await this.hre.unlock.deployProtocol(this.hre, undefined, undefined, 1)
    })
    it('Should create a lock from command line args', async function () {
      const { FIRST } = locks
      const lockAddress: string = await this.hre.run(TASK_CREATE_LOCK, FIRST)
      const lock = await this.hre.unlock.getLockContract(this.hre, lockAddress)
      assert.equal(lockAddress, lock.address)
      isIdenticalLock(lock, FIRST)
    })
  })
})
