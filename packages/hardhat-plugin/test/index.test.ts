/* eslint-disable prefer-arrow-callback */
// tslint:disable-next-line no-implicit-dependencies
import { assert, expect } from 'chai'

import networks from '@unlock-protocol/networks'

import { useEnvironment } from './helpers'
import { UnlockHRE } from '../src/Unlock'

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
        const unlockAddress = await this.hre.unlock.deployUnlock(undefined, 1)
        assert.isTrue(unlockAddress.includes('0x'))
        assert.equal(typeof unlockAddress, 'string')
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
        const publicLockAddress = await this.hre.unlock.deployPublicLock(
          undefined,
          1
        )
        assert.isTrue(publicLockAddress.includes('0x'))
        assert.equal(typeof publicLockAddress, 'string')
      })
    })
  })
})

// describe('Unit tests examples', function () {
//   describe('UnlockHardhatRuntimeEnvironment', function () {
//     describe('constructor', function () {
//       it('should store chainId correctly', function () {
//         const unlock = new UnlockHRE({ chainId: 1 })
//         assert.deepEqual(unlock.chainId, 1)
//       })

//       it('should store network info', function () {
//         const unlock = new UnlockHRE(1)
//         assert.deepEqual(unlock.network, networks[1])
//       })

//       it('should throw if network is unknown', function () {
//         assert.throws(() => new UnlockHRE(11563))
//       })
//     })
//   })
// })
