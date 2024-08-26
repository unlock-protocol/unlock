/* eslint strict: 0, global-require: 0 */
const assert = require('assert')

describe('main exports', () => {
  it('entry point parse correctly', () => {
    assert.doesNotThrow(() => require('../dist'))
  })

  it('contains valid exports', () => {
    const contracts = require('../dist')
    assert.notEqual(Object.keys(contracts).length, 0)

    const v0 = require('../dist/abis/Unlock/UnlockV13.json')
    assert.equal(v0.contractName, 'Unlock')
    assert(Object.keys(v0).includes('abi'))
    assert(Object.keys(v0).includes('bytecode'))

    const { UnlockV0 } = require('../dist')
    assert.equal(UnlockV0.contractName, 'Unlock')
    assert(Object.keys(UnlockV0).includes('abi'))
    assert(Object.keys(UnlockV0).includes('bytecode'))
  })
})
