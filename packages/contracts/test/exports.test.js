/* eslint strict: 0, global-require: 0 */
const { expect } = require('chai')

describe('main exports', () => {
    it('entry point parse correctly', () => {
        expect(() => require('../dist')).not.to.throw
    })

    it('contains valid exports', () => {
        const contracts = require('../dist');
        expect(Object.keys(contracts).length).not.to.equal(0)

        const v0 = require('../dist/abis/Unlock/UnlockV0.json')
        expect(v0.contractName).to.equal('Unlock')
        expect(Object.keys(v0)).to.contain('abi')
        expect(Object.keys(v0)).to.contain('bytecode')

        const { UnlockV0 } = require('../dist')
        expect(UnlockV0.contractName).to.equal('Unlock')
        expect(Object.keys(UnlockV0)).to.contain('abi')
        expect(Object.keys(UnlockV0)).to.contain('bytecode')

    })
})
