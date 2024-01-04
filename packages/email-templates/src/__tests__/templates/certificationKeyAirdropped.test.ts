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
      `Your NFT certification for "How To Deploy a Lock" was airdropped!`
    )
    expect(content.innerHTML).toContain(
      `<a href="https://app.unlock-protocol.com/certification">there</a>`
    )
  })

  it('should have keychainUrl if user wallet', () => {
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
      `Your NFT certification for "How To Deploy a Lock" was airdropped!`
    )
    expect(content.innerHTML).toContain(
      `<a href="https://app.unlock-protocol.com/certification">there</a>`
    )
  })

  it('should have details about how to view and print the certification!', () => {
    expect.assertions(1)

    const content = asHtml(
      prepareAll(certificationKeyAirdropped).html({
        keyId: '1337',
        lockName: 'How To Deploy a Lock',
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
        network: 'Polygon',
        certificationUrl: 'https://app.unlock-protocol.com/certification',
        isUserAddress: true,
      })
    )
    expect(content.textContent).toContain(
      `It has also been added to your Unlock Keychain, where you can view it and, if needed, print it as a signed QR Code!`
    )
  })

  it('should have transferUrl', () => {
    expect.assertions(1)

    const content = asHtml(
      prepareAll(certificationKeyAirdropped).html({
        keyId: '1337',
        lockName: 'How To Deploy a Lock',
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
        network: 'Polygon',
        certificationUrl: 'https://app.unlock-protocol.com/certification',
        isUserAddress: false,
      })
    )

    expect(content.textContent).toContain(
      `You can transfer it to your own wallet by going there.`
    )
  })

  it('should have the custom content', () => {
    expect.assertions(1)

    const content = asHtml(
      prepareAll(certificationKeyAirdropped).html({
        keyId: '1337',
        lockName: 'How To Deploy a Lock',
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
        network: 'Polygon',
        certificationUrl: 'https://app.unlock-protocol.com/certification',
        isUserAddress: false,
        customContent:
          'Please make sure to renew your certification next year!',
      })
    )

    expect(content.textContent).toContain(
      `Please make sure to renew your certification next year!`
    )
  })
})
