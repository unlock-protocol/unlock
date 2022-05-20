/* eslint strict: 0, global-require: 0 */

'use strict'

test('entry point parse', () => {
  expect(() => require('../src')).not.toThrow()
})

test('contains some lint instructions', () => {
  const lint = require('../src')
  expect(Object.keys(lint).length).toEqual(7)
  expect(lint.extends.includes('eslint:recommended'))
})
