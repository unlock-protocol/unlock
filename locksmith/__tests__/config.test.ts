// ABOUTME: Checks locksmith config defaults that only apply when running tests.
// ABOUTME: Guards against test runs reaching live services such as wedlocks.
import { describe, it, expect } from 'vitest'
import config from '../src/config/config'

describe('config', () => {
  it('points wedlocks to an unresolvable host so tests never send emails', () => {
    expect(new URL(config.services.wedlocks).hostname).toMatch(/\.invalid$/)
  })
})
