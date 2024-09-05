// eslint-disable-next-line reserved-reserved
import { expect, test } from 'vitest'

test('entry point parse', () => {
  expect(() => require('../src/index.js')).not.toThrow()
})

test('contains some lint instructions', () => {
  const lint = require('../src/base.js')
  expect(Object.keys(lint).length).toEqual(7)
  expect(lint.extends.includes('eslint:recommended'))
})
