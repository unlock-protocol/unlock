// @vitest-environment jsdom

import keyMined from '../../templates/keyMined'
import { prepareAll } from '../../templates/prepare'
import { asHtml } from '../utils'
import { expect, it, describe } from 'vitest'

describe('keyMined', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(
      prepareAll(keyMined).subject({
        keyId: '1337',
        lockName: 'Ethereal NYC 202',
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
        network: 'Polygon',
      })
    ).toBe('You have received a new NFT!')
  })

  it('should have the right text', () => {
    expect.assertions(2)
    const content = asHtml(
      prepareAll(keyMined).html({
        keyId: '1337',
        lockName: 'Ethereal NYC 202',
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
        network: 'Polygon',
      })
    )
    expect(content.textContent).toContain(`You have received a new NFT!`)
    expect(content.textContent).toContain(
      `A new membership (#1337) to the lock Ethereal NYC 202`
    )
  })

  it('should have a link to the keychain', () => {
    expect.assertions(1)
    const content = asHtml(
      prepareAll(keyMined).html({
        keyId: '1337',
        lockName: 'Ethereal NYC 202',
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
        network: 'Polygon',
      })
    )
    expect(content.innerHTML).toContain(
      `<a href="https://app.unlock-protocol.com/keychain">Unlock Keychain</a>`
    )
  })

  it('should have a link to the block explorer', () => {
    expect.assertions(1)
    const content = asHtml(
      prepareAll(keyMined).html({
        keyId: '1337',
        lockName: 'Ethereal NYC 202',
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
        network: 'Polygon',
        txUrl: 'http://txurl.com',
      })
    )
    expect(content.innerHTML).toContain(
      `<a href="http://txurl.com">block explorer</a>`
    )
  })

  it('should have the right text and have only tx open sea url', () => {
    expect.assertions(2)
    const content = prepareAll(keyMined).html({
      keyId: '1337',
      lockName: 'Ethereal NYC 202',
      network: 'Polygon',
      keychainUrl: 'https://app.unlock-protocol.com/keychain',
      openSeaUrl: 'http://opensealurl.com',
    })

    expect(asHtml(content).textContent).toContain(
      `A new membership (#1337) to the lock Ethereal NYC 202 was just minted for you`
    )
    expect(asHtml(content).innerHTML).toContain('href="http://opensealurl.com"')
  })

  it('should contains custom content', () => {
    expect.assertions(2)
    const content = prepareAll(keyMined).html({
      keyId: '1337',
      lockName: 'Ethereal NYC 202',
      network: 'Polygon',
      keychainUrl: 'https://app.unlock-protocol.com/keychain',
      openSeaUrl: 'http://opensealurl.com',
      customContent: `<h1>Custom content here</h1>`,
    })

    expect(asHtml(content).textContent).toContain(`Custom content here`)
    expect(asHtml(content).innerHTML).toContain('href="http://opensealurl.com"')
  })

  it('should have transaction receipt link', () => {
    expect.assertions(2)
    const content = prepareAll(keyMined).html({
      keyId: '1337',
      lockName: 'Ethereal NYC 202',
      network: 'Polygon',
      keychainUrl: 'https://app.unlock-protocol.com/keychain',
      openSeaUrl: 'http://opensealurl.com',
      transactionReceiptUrl: 'https://app.unlock-protocol.com/receipts',
    })

    expect(asHtml(content).textContent).toContain(
      'PS: you can view and print a transaction receipt if needed.'
    )
    expect(asHtml(content).innerHTML).toContain(
      'https://app.unlock-protocol.com/receipts'
    )
  })

  it('should not contains transaction receipt link', () => {
    expect.assertions(2)
    const content = prepareAll(keyMined).html({
      keyId: '1337',
      lockName: 'Ethereal NYC 202',
      network: 'Polygon',
      keychainUrl: 'https://app.unlock-protocol.com/keychain',
      openSeaUrl: 'http://opensealurl.com',
    })

    expect(asHtml(content).textContent).not.contain(
      'PS: you can view and print a transaction receipt if needed.'
    )
    expect(asHtml(content).innerHTML).not.contain(
      'https://app.unlock-protocol.com/receipts'
    )
  })
})
