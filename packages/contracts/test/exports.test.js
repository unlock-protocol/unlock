/* eslint strict: 0, global-require: 0 */
const assert = require('assert')

describe('main exports', () => {
  it('entry point parse correctly', () => {
    assert.doesNotThrow(() => require('../dist'))
  })

  it('contains valid exports', () => {
    const contracts = require('../dist')
    assert.notEqual(Object.keys(contracts).length, 0)

    const V12 = require('../dist/abis/Unlock/UnlockV12.json')
    assert.equal(V12.contractName, 'Unlock')
    assert(Object.keys(V12).includes('abi'))
    assert(Object.keys(V12).includes('bytecode'))

    const { UnlockV12 } = require('../dist')
    assert.equal(UnlockV12.contractName, 'Unlock')
    assert(Object.keys(UnlockV12).includes('abi'))
    assert(Object.keys(UnlockV12).includes('bytecode'))
  })
})
