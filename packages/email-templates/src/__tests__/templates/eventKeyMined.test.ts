// @vitest-environment jsdom

import eventKeyMined from '../../templates/eventKeyMined'
import { prepareAll } from '../../templates/prepare'
import { expect, it, describe } from 'vitest'
import { asHtml } from '../utils'
describe('eventKeyMined', () => {
  it('should have transaction receipt link', () => {
    expect.assertions(2)
    const template = prepareAll(eventKeyMined)
    const content = template.html({
      keyId: '1337',
      lockName: 'Ethereal NYC 2023',
      network: 'Polygon',
      keychainUrl: 'https://app.unlock-protocol.com/keychain',
      transactionReceiptUrl: 'https://app.unlock-protocol.com/receipts',
    })

    expect(asHtml(content).textContent).toContain(
      'PS: you can view and print a transaction receipt if needed.'
    )
    expect(asHtml(content).innerHTML).toContain(
      'https://app.unlock-protocol.com/receipts'
    )
  })

  it('should not have transaction receipt link', () => {
    expect.assertions(3)
    const template = prepareAll(eventKeyMined)
    const content = template.html({
      keyId: '1337',
      lockName: 'Ethereal NYC 2023',
      network: 'Polygon',
      keychainUrl: 'https://app.unlock-protocol.com/keychain',
    })

    expect(
      template.subject({
        lockName: 'Ethereal NYC 2023',
      })
    ).contain('Here is your ticket for Ethereal NYC 2023')

    expect(asHtml(content).textContent).not.contain(
      'PS: you can view and print a transaction receipt if needed.'
    )
    expect(asHtml(content).innerHTML).not.contain(
      'https://app.unlock-protocol.com/receipts'
    )
  })
})
