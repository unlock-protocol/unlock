import confirmEmail from '../../templates/confirmEmail'

describe('confirmEmail', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(confirmEmail.subject()).toBe('Please confirm your email address')
  })

  it('should have the right text', () => {
    expect.assertions(1)
    expect(
      confirmEmail.text({
        confirmLink: 'https://staging-app.unlock-protocol.com/keychain/',
        email: 'julien@unlock-protocol.com',
        signedEmail: 'privatekeyEncryptedEmail',
      })
    ).toBe(
      `Welcome to Unlock!

To get started, please confirm your email address by clicking on the following link:

  https://staging-app.unlock-protocol.com/keychain/?email=julien@unlock-protocol.com&signedEmail=privatekeyEncryptedEmail

Once your email address is confirmed, you'll be able to use your Unlock account to pay for content and services.

If you have any questions, you can always email us at hello@unlock-protocol.com.

And again, welcome!

The Unlock team
`
    )
  })
})
