// tslint:disable-next-line no-implicit-dependencies
import { assert } from 'chai'

import { useEnvironment } from './helpers'
import { UnlockHRE } from '../src/Unlock'

describe('Unlock Hardhat plugin', function () {
  describe('HRE extension', function () {
    useEnvironment('hardhat-project')

    it('Should add the unlock field', function () {
      assert.instanceOf(this.hre.unlock, UnlockHRE)
    })

    it('The example filed should say hello', function () {
      assert.equal(this.hre.unlock.deployLock(), 'hello')
    })
  })
})

describe('Unit tests examples', function () {
  describe('UnlockHardhatRuntimeEnvironment', function () {
    describe('sayHello', function () {
      it('Should say hello', function () {
        const field = new UnlockHRE()
        assert.equal(field.deployLock(), 'hello')
      })
    })
  })
})
