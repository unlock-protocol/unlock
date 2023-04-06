// @vitest-environment jsdom

import certificationKeyAirdropped from '../../templates/certificationKeyAirdropped'
import { prepareAll } from '../../templates/prepare'
import { expect, it, describe } from 'vitest'
import { asHtml } from '../utils'

describe('certificationKeyAirdropped', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(
      prepareAll(certificationKeyAirdropped).subject({
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
      prepareAll(certificationKeyAirdropped).html({
        keyId: '1337',
        lockName: 'How To Deploy a Lock',
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
        network: 'Polygon',
        certificationUrl: 'https://app.unlock-protocol.com/certification',
      })
    )

    expect(content.textContent).toContain(
      `Here is your NFT certification (#1337) for How To Deploy a Lock was just airdropped!`
    )
    expect(content.innerHTML).toContain(
      `<a href="https://app.unlock-protocol.com/certification">Here</a>`
    )
  })
})
