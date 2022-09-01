/* eslint-disable prefer-arrow-callback, func-names */
// tslint:disable-next-line no-implicit-dependencies
import { assert } from 'chai'
import type { Contract } from 'ethers'

import { networks } from '@unlock-protocol/networks'

import { useEnvironment, expectThrowsAsync } from './helpers'
import { UnlockHRE } from '../src/Unlock'
import type { LockArgs, UnlockProtocolContracts } from '../src/types'
import {
  UNLOCK_LATEST_VERSION,
  PUBLIC_LOCK_LATEST_VERSION,
  TASK_CREATE_LOCK,
} from '../src/constants'
import { locks } from './fixtures'

const defaultSignerAddress = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'

const isIdenticalLock = async (lock: Contract, lockArgs: LockArgs) => {
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
      assert.instanceOf(this.hre.unlock, UnlockHRE)
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

    describe('getChainId()', function () {
      it('should return chain ID', async function () {
        assert.equal(await this.hre.unlock.getChainId(), 31337)
      })
    })

    describe('getNetworkInfo()', function () {
      it('should return the network json', async function () {
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
    })

    describe('getSigner()', function () {
      it('should return a default signer', async function () {
        const [defaultSigner] = await this.hre.ethers.getSigners()
        assert.equal(
          (await this.hre.unlock.getSigner()).address,
          defaultSigner.address
        )
      })
    })

    describe('deployUnlock()', function () {
      it('Should deploy the Unlock contract', async function () {
        const unlock = await this.hre.unlock.deployUnlock(undefined, 1)
        assert.isTrue(unlock.address.includes('0x'))
        assert.equal(typeof unlock.address, 'string')
        assert.equal(await unlock.unlockVersion(), UNLOCK_LATEST_VERSION)
      })

      it('Should set the contract in HRE', async function () {
        await this.hre.unlock.deployUnlock(undefined, 1)
        assert.isTrue(Object.keys(this.hre.unlock).includes('unlock'))
        if (this.hre.unlock.unlock) {
          assert.equal(
            await this.hre.unlock.unlock.unlockVersion(),
            UNLOCK_LATEST_VERSION
          )
        }
      })

      it('Should fail if number version doesnt exist', async function () {
        await expectThrowsAsync(
          this.hre.unlock.deployUnlock,
          [135, 1],
          "Contract 'UnlockV135' is not in present in @unlock-protocol/contracts"
        )
      })
    })

    describe('setUnlock()', function () {
      it('Should set the Unlock contract to a given address', async function () {
        const unlock = await this.hre.unlock.deployUnlock(undefined, 1)
        assert.isTrue(Object.keys(this.hre.unlock).includes('unlock'))

        // remove existing unlock instance from class
        this.hre.unlock.unlock = undefined
        await expectThrowsAsync(
          this.hre.unlock.getUnlock,
          [],
          'Could not fetch the Unlock contract'
        )

        // add it back
        await this.hre.unlock.setUnlock(unlock.address)
        const unlockAgain = await this.hre.unlock.getUnlock()
        assert.equal(await unlockAgain.address, unlock.address)
        assert.equal(await unlockAgain.unlockVersion(), UNLOCK_LATEST_VERSION)
      })

      it('Should fail if contract does not exist', async function () {
        await expectThrowsAsync(
          // @ts-expect-error - Argument type mismatch
          this.hre.unlock.setUnlock,
          [],
          'Missing Unlock contract address'
        )
      })
    })

    describe('deployPublicLock()', function () {
      it('Should deploy the Unlock contract', async function () {
        const publicLock = await this.hre.unlock.deployPublicLock(undefined, 1)
        assert.isTrue(publicLock.address.includes('0x'))
        assert.equal(typeof publicLock.address, 'string')
      })
    })

    describe('deployProtocol()', function () {
      let protocol: UnlockProtocolContracts
      this.beforeEach(async function () {
        protocol = await this.hre.unlock.deployProtocol(undefined, undefined, 1)
      })
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
    })

    describe('getUnlock()', function () {
      it('Should retrieve the Unlock contract instance', async function () {
        const unlock = await this.hre.unlock.deployUnlock(undefined, 1)
        const unlockGet = await this.hre.unlock.getUnlock()
        assert.equal(typeof unlock, typeof unlockGet)
        assert.equal(unlock.address, unlockGet.address)
        assert.equal(await unlock.unlockVersion(), UNLOCK_LATEST_VERSION)
      })
      it('Should throw if the Unlock contract is not defined', async function () {
        await expectThrowsAsync(
          this.hre.unlock.getUnlock,
          [],
          'Could not fetch the Unlock contract'
        )
      })
    })

    describe('createLock()', function () {
      this.beforeEach(async function () {
        await this.hre.unlock.deployProtocol(undefined, undefined, 1)
      })

      it('Should create a new lock w correct params', async function () {
        const { FIRST } = locks
        const { lock, transactionHash, lockAddress } =
          await this.hre.unlock.createLock(FIRST)

        assert.equal(await lockAddress, lock.address)
        assert.equal(typeof transactionHash, 'string')
        isIdenticalLock(lock, FIRST)
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
        const lockGet = await this.hre.unlock.getLock(lock.address)
        assert.equal(
          await lockGet.publicLockVersion(),
          PUBLIC_LOCK_LATEST_VERSION
        )
        isIdenticalLock(lock, FIRST)
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
      await this.hre.unlock.deployProtocol(undefined, undefined, 1)
    })
    it('Should create a lock from command line args', async function () {
      const { FIRST } = locks
      const lockAddress: string = await this.hre.run(TASK_CREATE_LOCK, FIRST)
      const lock = await this.hre.unlock.getLock(lockAddress)
      assert.equal(lockAddress, lock.address)
      isIdenticalLock(lock, FIRST)
    })
  })
})
