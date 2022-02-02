/* eslint-disable prefer-arrow-callback */
// tslint:disable-next-line no-implicit-dependencies
import { assert } from 'chai'

import networks from '@unlock-protocol/networks'

import { useEnvironment } from './helpers'
import { UnlockHRE } from '../src/Unlock'

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

    describe('deployUnlock()', function () {
      it('Should deploy the Unlock contract', async function () {
        const unlockAddress = await this.hre.unlock.deployUnlock(9, 1)
        assert.isTrue(unlockAddress.includes('0x'))
        assert.equal(typeof unlockAddress, 'string')
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
