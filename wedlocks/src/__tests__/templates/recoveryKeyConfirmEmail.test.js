import recoveryKeyConfirmEmail from '../../templates/recoveryKeyConfirmEmail'

describe('recoveryKeyConfirmEmail', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(recoveryKeyConfirmEmail.subject()).toBe(
      'Please confirm your account recovery'
    )
  })

  it('should have the right text', () => {
    expect.assertions(1)
    expect(
      recoveryKeyConfirmEmail.text({
        recoveryKeyConfirmLink: 'https://foo/bar',
      })
    ).toBe(
      `We received a request to recover your account using your recovery key.

If you did not make this request, please disregard this email. Otherwise, please click on the following link to confirm your account recovery request:

  https://foo/bar

If you have any questions, you can always email us at hello@unlock-protocol.com.

The Unlock team
`
    )
  })
})
