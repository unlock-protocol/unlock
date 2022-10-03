/**
 * @jest-environment jsdom
 */
import confirmEmail from '../../templates/confirmEmail'
import { asHtml } from '../utils'

describe('confirmEmail', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(confirmEmail.subject()).toBe('Please confirm your email address')
  })

  it('should have the right text', () => {
    expect.assertions(1)
    expect(
      asHtml(
        confirmEmail.html({
          confirmLink: 'https://staging-app.unlock-protocol.com/keychain/',
          email: 'julien@unlock-protocol.com',
          signedEmail: 'privatekeyEncryptedEmail',
        })
      )
    ).toHaveTextContent(
      `Welcome to Unlock! To get started, please confirm your email address by clicking on this link. You can also copy and paste the following URL on your web browser: https://staging-app.unlock-protocol.com/keychain/?email=julien@unlock-protocol.com&signedEmail=privatekeyEncryptedEmail Once your email address is confirmed, you'll be able to use your Unlock account to pay for content and services.`
    )
  })
})
