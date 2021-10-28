/* eslint strict: 0, global-require: 0 */

'use strict';

test('entry point parse', () => {
    expect(() => require('../dist')).not.toThrow()
})

test('contains valid exports', () => {
    const contracts = require('../dist');
    expect(Object.keys(contracts).length).not.toEqual(0)
    
    const v0 = require('../dist/abis/Unlock/UnlockV0.json')
    expect(v0.contractName).toEqual('Unlock')
    expect(Object.keys(v0)).toContain('abi')
    expect(Object.keys(v0)).toContain('bytecode')
    
    const { UnlockV0 } = require('../dist')
    expect(UnlockV0.contractName).toEqual('Unlock')
    expect(Object.keys(UnlockV0)).toContain('abi')
    expect(Object.keys(UnlockV0)).toContain('bytecode')

})