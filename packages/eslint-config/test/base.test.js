// eslint-disable-next-line reserved-reserved
import { test, expect } from 'vitest'

test('entry point parse', () => {
  expect(() => require('../src')).not.toThrow()
})

test('contains some lint instructions', () => {
  const lint = require('../src/base')
  expect(Object.keys(lint).length).toEqual(7)
  expect(lint.extends.includes('eslint:recommended'))
})
