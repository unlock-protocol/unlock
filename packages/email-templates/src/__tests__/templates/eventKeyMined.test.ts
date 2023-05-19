// @vitest-environment jsdom

import eventKeyMined from '../../templates/eventKeyMined'
import { prepareAll } from '../../templates/prepare'
import { expect, it, describe } from 'vitest'
import { asHtml } from '../utils'
describe('eventKeyMined', () => {
  it('should have transaction receipt link', () => {
    expect.assertions(2)
    const content = prepareAll(eventKeyMined).html({
      keyId: '1337',
      lockName: 'Ethereal NYC 202',
      network: 'Polygon',
      keychainUrl: 'https://app.unlock-protocol.com/keychain',
      openSeaUrl: 'http://opensealurl.com',
      transactionReceiptUrl: 'https://app.unlock-protocol.com/receipts',
    })

    expect(asHtml(content).textContent).toContain(
      `Access your receipts by visiting this link you can easily download your transaction receipt.`
    )
    expect(asHtml(content).innerHTML).toContain(
      'https://app.unlock-protocol.com/receipts'
    )
  })

  it('should not have transaction receipt link', () => {
    expect.assertions(2)
    const content = prepareAll(eventKeyMined).html({
      keyId: '1337',
      lockName: 'Ethereal NYC 202',
      network: 'Polygon',
      keychainUrl: 'https://app.unlock-protocol.com/keychain',
      openSeaUrl: 'http://opensealurl.com',
    })

    expect(asHtml(content).textContent).not.contain(
      `Access your receipts by visiting this link you can easily download your transaction receipt.`
    )
    expect(asHtml(content).innerHTML).not.contain(
      'https://app.unlock-protocol.com/receipts'
    )
  })
})
