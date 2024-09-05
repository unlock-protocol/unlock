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

const defaultSignerAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

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

    it('unlockAddress should init as undefined ', function () {
      assert.equal(this.hre.unlock.unlockAddress, undefined)
    })

    it('should store and extend existing networks info', function () {
      assert.isTrue(Object.keys(this.hre.unlock.networks).includes('1'))
      assert.equal(this.hre.unlock.networks['1'].name, networks['1'].name)
      assert.equal(this.hre.unlock.networks['1'].id, networks['1'].id)
      assert.equal(this.hre.unlock.networks['1'].unlockAddress, 'newAddress')
    })
    it('should store additional networks info', function () {
      assert.isTrue(Object.keys(this.hre.unlock.networks).includes('12345'))
      assert.isTrue(Object.keys(this.hre.unlock.networks).includes('31337'))
      assert.equal(
        this.hre.unlock.networks['31337'].name,
        'Custom Localhost Name'
      )
      assert.equal(
        this.hre.unlock.networks['31337'].subgraph?.endpoint,
        'here goes a subgraph URI'
      )
    })

    describe('functions', function () {
      let protocol: {
        unlock: Contract
        publicLock: Contract
      }
      this.beforeEach(async function () {
        protocol = await this.hre.unlock.deployProtocol()
      })

      describe('deployProtocol()', function () {
        it('Should deploy the PublicLock contract', async function () {
          const { publicLock } = protocol
          const publicLockAddress = await publicLock.getAddress()
          assert.isTrue(publicLockAddress.includes('0x'))
          assert.equal(typeof publicLockAddress, 'string')
        })
        it('Should deploy the Unlock contract', async function () {
          const { unlock } = protocol
          const unlockAddress = await unlock.getAddress()
          assert.isTrue(unlockAddress.includes('0x'))
          assert.equal(typeof unlockAddress, 'string')
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
          assert.equal(
            await unlock.publicLockAddress(),
            await publicLock.getAddress()
          )
          assert.equal(await unlock.unlockVersion(), UNLOCK_LATEST_VERSION)
          assert.equal(
            await unlock.publicLockImpls(PUBLIC_LOCK_LATEST_VERSION),
            await publicLock.getAddress()
          )
          assert.equal(
            await unlock.publicLockVersions(await publicLock.getAddress()),
            PUBLIC_LOCK_LATEST_VERSION
          )
          assert.equal(
            await unlock.publicLockLatestVersion(),
            PUBLIC_LOCK_LATEST_VERSION
          )
        })
        it('Should store deployed Unlock address in hre', async function () {
          const { unlock } = protocol
          assert.equal(this.hre.unlock.unlockAddress, await unlock.getAddress())
        })
      })

      describe('getUnlockContract()', function () {
        let protocol: {
          unlock: Contract
          publicLock: Contract
        }
        this.beforeEach(async function () {
          protocol = await this.hre.unlock.deployProtocol()
        })
        it('Should retrieve the Unlock contract instance', async function () {
          const { unlock } = protocol
          const unlockGet = await this.hre.unlock.getUnlockContract(
            await unlock.getAddress()
          )
          assert.equal(typeof unlock, typeof unlockGet)
          assert.equal(this.hre.unlock.unlockAddress, await unlock.getAddress())
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
            await this.hre.unlock.createLock(FIRST)

          assert.equal(lockAddress, await lock.getAddress())
          assert.equal(typeof transactionHash, 'string')
          isIdenticalLock(lock, FIRST)
        })
      })

      describe('deployAndSetTemplate()', function () {
        it('Should deploy and set a new version', async function () {
          const previousVersion = PUBLIC_LOCK_LATEST_VERSION - 1
          const { FIRST } = locks

          // deploy protocol w previous lock version
          const { unlock, publicLock: publicLockBefore } =
            await this.hre.unlock.deployProtocol(undefined, previousVersion)

          // makes sure version is set correctly
          assert.equal(await unlock.publicLockLatestVersion(), previousVersion)
          assert.equal(
            await unlock.publicLockAddress(),
            await publicLockBefore.getAddress()
          )

          // deploy and set the new template
          const publicLock = await this.hre.unlock.deployAndSetTemplate(
            PUBLIC_LOCK_LATEST_VERSION,
            1
          )
          assert.equal(
            await unlock.publicLockAddress(),
            await publicLock.getAddress()
          )
          assert.notEqual(
            await publicLockBefore.getAddress(),
            await publicLock.getAddress()
          )
          assert.equal(
            await unlock.publicLockImpls(PUBLIC_LOCK_LATEST_VERSION),
            await publicLock.getAddress()
          )
          assert.equal(
            await unlock.publicLockVersions(await publicLock.getAddress()),
            PUBLIC_LOCK_LATEST_VERSION
          )
          assert.equal(
            await unlock.publicLockLatestVersion(),
            PUBLIC_LOCK_LATEST_VERSION
          )

          // create a lock at correct version by default
          const { lock } = await this.hre.unlock.createLock(FIRST)
          assert.equal(
            await lock.publicLockVersion(),
            PUBLIC_LOCK_LATEST_VERSION
          )
        })
      })

      describe('getLock()', function () {
        let lock: Contract
        const { FIRST } = locks
        this.beforeEach(async function () {
          await this.hre.unlock.deployProtocol(undefined, undefined, 1)
          ;({ lock } = await this.hre.unlock.createLock(FIRST))
        })

        it('Should retrieve a lock w correct params', async function () {
          const lockGet = await this.hre.unlock.getLockContract(
            await lock.getAddress()
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
      [...Object.keys(networks), '12345', '31337'].sort()
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
      await this.hre.unlock.deployProtocol(undefined, undefined, 1)
    })
    it('Should create a lock from command line args', async function () {
      const { FIRST } = locks
      // convert bigint to int
      const cliArgs = {
        ...FIRST,
        keyPrice: parseInt(FIRST.keyPrice.toString()),
      }
      const lockAddress: string = await this.hre.run(TASK_CREATE_LOCK, cliArgs)
      const lock = await this.hre.unlock.getLockContract(lockAddress)
      assert.equal(lockAddress, await lock.getAddress())
      isIdenticalLock(lock, FIRST)
    })
  })
})
