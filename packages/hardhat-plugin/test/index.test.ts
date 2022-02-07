/* eslint-disable prefer-arrow-callback */
// tslint:disable-next-line no-implicit-dependencies
import { assert, expect } from 'chai'

import { networks } from '@unlock-protocol/networks'

import { useEnvironment } from './helpers'
import { UnlockHRE } from '../src/Unlock'
import type { UnlockProtocolContracts } from '../src/Unlock'
import {
  UNLOCK_LATEST_VERSION,
  PUBLIC_LOCK_LATEST_VERSION,
} from '../src/constants'

import { locks } from './fixtures'

/**
 * Takes in a function and checks for error
 * @param {Function} method - The function to check
 * @param {any[]} params - The array of function parameters
 * @param {string} message - Optional message to match with error message
 */
const expectThrowsAsync = async (
  method: Function,
  params: any[],
  message?: string
) => {
  let err: unknown | null = null
  try {
    await method(...params)
  } catch (error) {
    err = error
  }
  if (err instanceof Error) {
    expect(err.message).to.be.equal(message)
  } else {
    expect(err).to.be.an('Error')
  }
}

describe('Unlock Hardhat plugin', function () {
  describe('HRE extension', function () {
    useEnvironment('hardhat-project')

    it('Should add the unlock field', function () {
      assert.instanceOf(this.hre.unlock, UnlockHRE)
    })

    it('should store networks info', function () {
      assert.isTrue(Object.keys(this.hre.unlock.networks).includes('31337'))
      assert.deepEqual(this.hre.unlock.networks['31337'], networks['31337'])
    })

    describe('getChainId()', function () {
      it('should return chain ID', async function () {
        assert.equal(await this.hre.unlock.getChainId(), 31337)
      })
    })

    describe('getNetworkInfo()', function () {
      it('should return the network json', async function () {
        assert.deepEqual(
          await this.hre.unlock.getNetworkInfo(),
          networks['31337']
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
      it('should parse mnemonic', async function () {
        process.env.WALLET_PRIVATE_KEY =
          '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a'
        assert.equal(
          (await this.hre.unlock.getSigner()).address.toLowerCase(),
          '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65'
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

      it('Should fail if number version doesnt exist', async function () {
        await expectThrowsAsync(
          this.hre.unlock.deployUnlock,
          [135, 1],
          "Contract 'UnlockV135' is not in present in @unlock-protocol/contracts"
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
        const [defaultSigner] = await this.hre.ethers.getSigners()
        const { unlock } = protocol
        assert.equal((await unlock.owner()).address, defaultSigner.address)
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
        const {
          lock,
          transactionHash,
          lockAddress,
        } = await this.hre.unlock.createLock(FIRST)
        assert.equal(await lockAddress, lock.address)
        assert.equal(typeof transactionHash, 'string')
        assert.equal(await lock.publicLockVersion(), PUBLIC_LOCK_LATEST_VERSION)
        assert.equal(await lock.name(), FIRST.name)
        assert.equal(
          (await lock.keyPrice()).toString(),
          FIRST.keyPrice.toString()
        )
        assert.equal(await lock.maxNumberOfKeys(), FIRST.maxNumberOfKeys)
        assert.equal(await lock.expirationDuration(), FIRST.expirationDuration)
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
