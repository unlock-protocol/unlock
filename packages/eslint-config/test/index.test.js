/* eslint strict: 0, global-require: 0 */

'use strict';

test('entry point parse', () => {
    expect(() => require('..')).not.toThrow()
})

test('contains some lint instructions', () => {
    const lint = require('..');
    expect(Object.keys(lint).length).toEqual(6)
    expect(lint.extends.includes('standard'))
    expect(lint.extends.includes('airbnb'))

})