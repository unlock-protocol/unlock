import { describe, expect, it } from 'vitest'
import { buildReceiptEmailParams } from '../../src/utils/receiptEmail'

describe('receiptEmail utils', () => {
  it('builds receipt email params with rendered content and receipt links', async () => {
    const params = await buildReceiptEmailParams({
      content: 'Thanks **buyer**.',
      hash: '0xabc',
      lockAddress: '0x123',
      network: 10,
      subject: 'Your receipt',
      unlockApp: 'https://app.unlock-protocol.test',
    })

    expect(params).toEqual({
      content: '<p>Thanks <strong>buyer</strong>.</p>\n',
      keychainUrl: 'https://app.unlock-protocol.test/keychain',
      lockAddress: '0x123',
      network: '10',
      receiptUrl:
        'https://app.unlock-protocol.test/receipts?address=0x123&network=10&hash=0xabc',
      subject: 'Your receipt',
    })
  })
})
