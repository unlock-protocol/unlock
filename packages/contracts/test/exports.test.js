/* eslint strict: 0, global-require: 0 */
const assert = require('assert')

describe('main exports', () => {
  it('entry point parse correctly', () => {
    assert.doesNotThrow(() => require('../dist'))
  })

  it('contains valid exports', () => {
    const contracts = require('../dist')
    assert.notEqual(Object.keys(contracts).length, 0)

    const V13 = require('../dist/abis/Unlock/UnlockV13.json')
    assert.equal(V13.contractName, 'Unlock')
    assert(Object.keys(V13).includes('abi'))
    assert(Object.keys(V13).includes('bytecode'))

    const { UnlockV13 } = require('../dist')
    assert.equal(UnlockV13.contractName, 'Unlock')
    assert(Object.keys(UnlockV13).includes('abi'))
    assert(Object.keys(UnlockV13).includes('bytecode'))
  })
})
