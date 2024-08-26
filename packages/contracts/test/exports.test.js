/* eslint strict: 0, global-require: 0 */
const assert = require('assert')

describe('main exports', () => {
  it('entry point parse correctly', () => {
    assert.doesNotThrow(() => require('../dist'))
  })

  it('contains valid exports', () => {
    const contracts = require('../dist')
    assert.notEqual(Object.keys(contracts).length, 0)

    const V10 = require('../dist/abis/Unlock/UnlockV10.json')
    assert.equal(V10.contractName, 'Unlock')
    assert(Object.keys(V10).includes('abi'))
    assert(Object.keys(V10).includes('bytecode'))

    const { UnlockV10 } = require('../dist')
    assert.equal(UnlockV10.contractName, 'Unlock')
    assert(Object.keys(UnlockV10).includes('abi'))
    assert(Object.keys(UnlockV10).includes('bytecode'))
  })
})
