/**
 * @jest-environment jsdom
 */
import keyMined from '../../templates/keyMined'
import { asHtml } from '../utils'

describe('keyMined', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(
      keyMined.subject({
        keyId: '1337',
        lockName: 'Ethereal NYC 202',
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
        network: 'Polygon',
      })
    ).toBe('A key was added to your wallet!')
  })

  it('should have the right text', () => {
    expect.assertions(1)
    const content = asHtml(
      keyMined.html({
        keyId: '1337',
        lockName: 'Ethereal NYC 202',
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
        network: 'Polygon',
      })
    )
    expect(content).toHaveTextContent(
      ` new NFT in your wallet! A new NFT key (#1337) to the lock Ethereal NYC 202 was just minted for you! It has been added to your Unlock Keychain, where you can view it and, if needed, print it as a signed QR Code!`
    )
  })

  it('should have a link to the keychain', () => {
    expect.assertions(1)
    const content = asHtml(
      keyMined.html({
        keyId: '1337',
        lockName: 'Ethereal NYC 202',
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
        network: 'Polygon',
      })
    )
    expect(content).toContainHTML(
      `<a href="https://app.unlock-protocol.com/keychain">Unlock Keychain</a>`
    )
  })

  it('should have a link to the block explorer', () => {
    expect.assertions(1)
    const content = asHtml(
      keyMined.html({
        keyId: '1337',
        lockName: 'Ethereal NYC 202',
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
        network: 'Polygon',
        txUrl: 'http://txurl.com',
      })
    )
    expect(content).toContainHTML(
      `<a href="http://txurl.com">block explorer</a>`
    )
  })

  it('should have the right text and have only tx open sea url', () => {
    expect.assertions(2)
    const content = keyMined.html({
      keyId: '1337',
      lockName: 'Ethereal NYC 202',
      network: 'Polygon',
      keychainUrl: 'https://app.unlock-protocol.com/keychain',
      openSeaUrl: 'http://opensealurl.com',
    })

    expect(asHtml(content)).toHaveTextContent(
      `A new NFT key (#1337) to the lock Ethereal NYC 202 was just minted`
    )
    expect(asHtml(content)).toContainHTML('href="http://opensealurl.com"')
  })
})
