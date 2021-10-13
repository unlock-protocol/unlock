/* eslint strict: 0, global-require: 0 */

'use strict';

test('entry point parse', () => {
    expect(() => require('../dist')).not.toThrow()
})

test('contains some exports', () => {
    const contracts = require('../dist');
    console.log(Object.keys(contracts))
    expect(Object.keys(contracts).length).not.toEqual(0)
})