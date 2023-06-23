// @vitest-environment jsdom

import certificationKeyMined from '../../templates/certificationKeyMined'
import { prepareAll } from '../../templates/prepare'
import { expect, it, describe } from 'vitest'
import { asHtml } from '../utils'

describe('certificationKeyMinded', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(
      prepareAll(certificationKeyMined).subject({
        keyId: '1337',
        lockName: 'How To Deploy a Lock',
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
        network: 'Polygon',
      })
    ).toBe('Your certification for How To Deploy a Lock')
  })

  it('should have the right content', () => {
    expect.assertions(2)

    const content = asHtml(
      prepareAll(certificationKeyMined).html({
        keyId: '1337',
        lockName: 'How To Deploy a Lock',
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
        network: 'Polygon',
        certificationUrl: 'https://app.unlock-protocol.com/certification',
      })
    )

    expect(content.textContent).toContain(
      `Your NFT certification for "How To Deploy a Lock" was sent to you!`
    )
    expect(content.innerHTML).toContain(
      `<a href="https://app.unlock-protocol.com/keychain">Unlock Keychain</a>`
    )
  })
})
