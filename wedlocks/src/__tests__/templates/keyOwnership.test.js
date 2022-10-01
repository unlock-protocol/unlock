/**
 * @jest-environment jsdom
 */
import { asHtml } from '../utils'
import keyOwnership from '../../templates/keyOwnership'

describe('keyOwnership', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(
      keyOwnership.subject({
        lockName: 'Unlock Blog Members',
      })
    ).toEqual('Your proof of key ownership for "Unlock Blog Members"')
  })

  it('should have the right text', () => {
    expect.assertions(1)
    expect(
      asHtml(
        keyOwnership.html({
          lockName: 'Unlock Blog Members',
          keychainLink: 'https://app.unlock-protocol.com/keychain',
        })
      )
    ).toHaveTextContent(
      `QR Code The QR code attached to this email proves that you own a key for Unlock Blog Members. If you're asked to prove that you own this NFT, simply show the QR code attached to this email. The signature contained in this QR code has a timestamp, so if it's been a very long time you may want to generate a fresher code on your keychain.`
    )
  })
})
