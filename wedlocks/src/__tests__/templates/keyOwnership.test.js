// @vitest-environment jsdom

import { asHtml } from '../utils'
import { prepareAll } from '../../templates/prepare'
import { expect, it, describe } from 'vitest'
import { EmailTemplates } from '@unlock-protocol/email-templates'

const { keyOwnership } = EmailTemplates

describe('keyOwnership', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(
      prepareAll(keyOwnership).subject({
        lockName: 'Unlock Blog Members',
      })
    ).toEqual('Your proof of key ownership for "Unlock Blog Members"')
  })

  it('should have the right text', () => {
    expect.assertions(1)
    const content = asHtml(
      prepareAll(keyOwnership).html({
        lockName: 'Unlock Blog Members',
        keychainLink: 'https://app.unlock-protocol.com/keychain',
      })
    ).textContent

    expect(content).toContain(
      `The QR code attached to this email proves that you own a key for Unlock Blog Members`
    )
  })
})
