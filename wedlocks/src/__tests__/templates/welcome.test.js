import welcome from '../../templates/welcome'

describe('welcome', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(welcome.subject()).toBe(
      'Welcome to Unlock! Please, read this email carefuly'
    )
  })

  it('should have the right text', () => {
    expect.assertions(1)
    expect(
      welcome.text({
        recoveryLink: 'https://app.unlock-protocol.com/recover?SECRET',
      })
    ).toBe(
      `Welcome to Unlock! We're excited to have you with us!

Unlock is designed to make sure we can never access your data: it's encrypted with your password. Because of that, we can't reset your password like other services that you're used to.

We know that sometimes things happen, and you may find that you need to reset your password in the future. To do that, you will need to use the following link:

https://app.unlock-protocol.com/recover?SECRET

Please, make sure to keep this link secret: do not forward this email to anyone. If someone accesses this email, they will be able to take over your Unlock account and all associated memberships.

It is important that you never lose this link, as YOU CANNOT RESET YOUR PASSWORD WITHOUT THIS RECOVERY LINK.

If you have any questions, you can always email us at hello@unlock-protocol.com.

The Unlock team
`
    )
  })
})
