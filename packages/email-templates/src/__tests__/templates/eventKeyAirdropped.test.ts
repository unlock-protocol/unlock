// @vitest-environment jsdom

import eventKeyAirdropped from '../../templates/eventKeyAirdropped'
import { prepareAll } from '../../templates/prepare'
import { expect, it, describe } from 'vitest'

describe('eventKeyAirdropped', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(
      prepareAll(eventKeyAirdropped).subject({
        keyId: '1337',
        lockName: "Ethereal's NYC conference 2022",
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
        network: 'Polygon',
      })
    ).toBe('Here is your ticket!')
  })

  it('should have the custom content!', () => {
    expect.assertions(1)
    const content = prepareAll(eventKeyAirdropped).html({
      keyId: '1337',
      lockName: "Ethereal's NYC conference 2022",
      keychainUrl: 'https://app.unlock-protocol.com/keychain',
      network: 'Polygon',
      customContent: 'We look forward to see you in person!',
    })
    expect(content).toContain('We look forward to see you in person!')
  })
})
