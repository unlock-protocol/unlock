// tslint:disable-next-line no-implicit-dependencies
import path from 'path'
import { assert } from 'chai'

import { UnlockHardhatRuntimeEnvironment } from '../src/UnlockHardhatRuntimeEnvironment'

import { useEnvironment } from './helpers'

describe('Integration tests examples', function () {
  describe('Hardhat Runtime Environment extension', function () {
    useEnvironment('hardhat-project')

    it('Should add the example field', function () {
      assert.instanceOf(this.hre.unlock, UnlockHardhatRuntimeEnvironment)
    })

    it('The example filed should say hello', function () {
      assert.equal(this.hre.unlock.sayHello(), 'hello')
    })
  })

  describe('HardhatConfig extension', function () {
    useEnvironment('hardhat-project')

    it('Should add the newPath to the config', function () {
      assert.equal(
        this.hre.config.paths.newPath,
        path.join(process.cwd(), 'asd')
      )
    })
  })
})

describe('Unit tests examples', function () {
  describe('UnlockHardhatRuntimeEnvironment', function () {
    describe('sayHello', function () {
      it('Should say hello', function () {
        const field = new UnlockHardhatRuntimeEnvironment()
        assert.equal(field.sayHello(), 'hello')
      })
    })
  })
})
