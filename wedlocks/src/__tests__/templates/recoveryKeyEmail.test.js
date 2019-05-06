import recoveryKeyEmail from '../../templates/recoveryKeyEmail'

describe('recoveryKeyEmail', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(recoveryKeyEmail.subject()).toBe("Here's your private recovery key")
  })

  it('should have the right text', () => {
    expect.assertions(1)
    expect(
      recoveryKeyEmail.text({
        recoveryKey: 'klaatu barada nikto',
      })
    ).toBe(
      `Unlock is designed to make sure we can never access your data: it's encrypted by your password. Because of that, we can't reset your password like other services.

We know that sometimes things happen, and you may find that you need to reset your password in the future. To do that, you will need to supply the following recovery key:

klaatu barada nikto

We recommend that you make sure you've saved this key somewhere safe where you'll be able to find it again, and then delete this email. WE CANNOT RESET YOUR PASSWORD WITHOUT THIS RECOVERY KEY.

If you have any questions, you can always email us at hello@unlock-protocol.com.

The Unlock team
`
    )
  })
})
