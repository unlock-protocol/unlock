// @vitest-environment jsdom

import confirmEmail from '../../templates/confirmEmail'
import { prepareAll } from '../../templates/prepare'
import { asHtml } from '../utils'
import { expect, it, describe } from 'vitest'

describe('confirmEmail', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(prepareAll(confirmEmail).subject()).toBe(
      'Please confirm your email address'
    )
  })

  it('should have the right text', () => {
    expect.assertions(2)
    const content = asHtml(
      prepareAll(confirmEmail).html({
        confirmLink: 'https://staging-app.unlock-protocol.com/keychain/',
        email: 'julien@unlock-protocol.com',
        signedEmail: 'privatekeyEncryptedEmail',
      })
    ).textContent

    expect(content).toContain(
      `You can also copy and paste the following URL on your web browser: https://staging-app.unlock-protocol.com/keychain/?email=julien@unlock-protocol.com&signedEmail=privatekeyEncryptedEmail`
    )
    expect(content).toContain(
      `Once your email address is confirmed, you'll be able to use your Unlock account to pay for content and services.`
    )
  })
})
